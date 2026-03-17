"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import imageCompression from "browser-image-compression";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import type { Media } from "@/types/media";

// 이미지 압축 옵션
const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
};

// 썸네일 생성
async function createThumbnail(file: File, maxSize = 300): Promise<Blob> {
  return imageCompression(file, {
    maxSizeMB: 0.1,
    maxWidthOrHeight: maxSize,
    useWebWorker: true,
  });
}

// 이미지 파일 압축
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  if (file.size <= 500 * 1024) return file; // 500KB 이하면 패스
  return imageCompression(file, COMPRESSION_OPTIONS);
}

export function useMedia(familyId: string | undefined) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(getFirebaseDb(), "families", familyId, "media"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Media[];
      setMediaList(data);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load media:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [familyId]);

  const uploadMedia = async (
    file: File,
    metadata: {
      title?: string;
      description?: string;
      taggedMembers?: { id: string; name: string }[];
      storyId?: string;
    },
    userId: string
  ): Promise<Media | null> => {
    if (!familyId) return null;

    // 이미지 압축
    const isImage = file.type.startsWith("image/");
    const processedFile = isImage ? await compressImage(file) : file;

    const fileExt = file.name.split(".").pop();
    const baseName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const fileName = `${baseName}.${fileExt}`;
    const storagePath = `families/${familyId}/media/${fileName}`;
    const storageRef = ref(getFirebaseStorage(), storagePath);

    // 썸네일 업로드 (이미지만)
    let thumbnailUrl = "";
    if (isImage && file.type !== "image/gif") {
      try {
        const thumbBlob = await createThumbnail(file);
        const thumbPath = `families/${familyId}/media/thumbs/${baseName}.${fileExt}`;
        const thumbRef = ref(getFirebaseStorage(), thumbPath);
        await uploadBytesResumable(thumbRef, thumbBlob);
        thumbnailUrl = await getDownloadURL(thumbRef);
      } catch {
        // 썸네일 실패해도 원본 업로드는 계속
      }
    }

    const uploadTask = uploadBytesResumable(storageRef, processedFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setUploadProgress(null);
          reject(error);
        },
        async () => {
          setUploadProgress(null);
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

          const mediaType = file.type.startsWith("image/")
            ? "PHOTO"
            : file.type.startsWith("video/")
            ? "VIDEO"
            : "AUDIO";

          const mediaDoc = await addDoc(
            collection(getFirebaseDb(), "families", familyId, "media"),
            {
              type: mediaType,
              fileName: file.name,
              storagePath,
              downloadUrl,
              thumbnailUrl: thumbnailUrl || null,
              mimeType: file.type,
              fileSize: processedFile.size,
              title: metadata.title || "",
              description: metadata.description || "",
              taggedMembers: metadata.taggedMembers || [],
              storyId: metadata.storyId || null,
              uploadedBy: userId,
              createdAt: serverTimestamp(),
            }
          );

          resolve({
            id: mediaDoc.id,
            type: mediaType,
            fileName: file.name,
            storagePath,
            downloadUrl,
            thumbnailUrl,
            mimeType: file.type,
            fileSize: processedFile.size,
            taggedMembers: metadata.taggedMembers || [],
            uploadedBy: userId,
          } as Media);
        }
      );
    });
  };

  const deleteMedia = async (media: Media) => {
    if (!familyId) return;

    // Delete from Storage
    const storageRef = ref(getFirebaseStorage(), media.storagePath);
    await deleteObject(storageRef).catch(() => {});

    // Delete from Firestore
    await deleteDoc(doc(getFirebaseDb(), "families", familyId, "media", media.id));
  };

  return { mediaList, loading, uploadProgress, uploadMedia, deleteMedia };
}
