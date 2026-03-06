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
import { db, storage } from "@/lib/firebase";
import type { Media } from "@/types/media";

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
      collection(db, "families", familyId, "media"),
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

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storagePath = `families/${familyId}/media/${fileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

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
            collection(db, "families", familyId, "media"),
            {
              type: mediaType,
              fileName: file.name,
              storagePath,
              downloadUrl,
              mimeType: file.type,
              fileSize: file.size,
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
            mimeType: file.type,
            fileSize: file.size,
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
    const storageRef = ref(storage, media.storagePath);
    await deleteObject(storageRef).catch(() => {});

    // Delete from Firestore
    await deleteDoc(doc(db, "families", familyId, "media", media.id));
  };

  return { mediaList, loading, uploadProgress, uploadMedia, deleteMedia };
}
