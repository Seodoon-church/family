"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image, Video, Mic } from "lucide-react";
import { MEDIA_MAX_SIZES } from "@/lib/constants";

interface MediaUploadProps {
  onUpload: (file: File, metadata: { title?: string; description?: string }) => Promise<void>;
  onClose: () => void;
  uploadProgress: number | null;
}

export function MediaUpload({ onUpload, onClose, uploadProgress }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError("");

    // Validate file type
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/") && !f.type.startsWith("audio/")) {
      setError("사진, 동영상, 음성 파일만 업로드 가능합니다.");
      return;
    }

    // Validate file size
    const maxSize = f.type.startsWith("image/")
      ? MEDIA_MAX_SIZES.PHOTO
      : f.type.startsWith("video/")
      ? MEDIA_MAX_SIZES.VIDEO
      : MEDIA_MAX_SIZES.AUDIO;

    if (f.size > maxSize) {
      setError(`파일 크기가 ${Math.round(maxSize / 1024 / 1024)}MB를 초과합니다.`);
      return;
    }

    setFile(f);

    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    await onUpload(file, { title, description });
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8 text-muted" />;
    if (file.type.startsWith("image/")) return <Image className="w-8 h-8 text-accent-green" />;
    if (file.type.startsWith("video/")) return <Video className="w-8 h-8 text-accent-blue" />;
    return <Mic className="w-8 h-8 text-accent-gold" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-heading text-lg">미디어 업로드</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-primary-light">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragActive ? "border-primary bg-primary-light/30" : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {preview ? (
              <img src={preview} alt="미리보기" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <>
                {getFileIcon()}
                <p className="text-sm text-muted mt-2">
                  {file ? file.name : "파일을 드래그하거나 클릭하여 선택"}
                </p>
              </>
            )}

            {file && !preview && (
              <p className="text-xs text-muted mt-1">
                {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
              </p>
            )}
          </div>

          {error && <p className="text-sm text-accent-red">{error}</p>}

          <Input
            id="media-title"
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="미디어 제목 (선택)"
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="사진/영상에 대한 설명 (선택)"
            />
          </div>

          {/* Progress */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="h-2 bg-primary-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted text-center">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || uploadProgress !== null}
              className="flex-1"
            >
              {uploadProgress !== null ? "업로드 중..." : "업로드"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
