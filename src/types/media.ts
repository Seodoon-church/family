import { Timestamp } from "firebase/firestore";

export type MediaType = "PHOTO" | "VIDEO" | "AUDIO";

export interface Media {
  id: string;
  type: MediaType;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSize: number;
  title?: string;
  description?: string;
  takenAt?: Timestamp;
  location?: string;
  duration?: number;
  width?: number;
  height?: number;
  taggedMembers: { id: string; name: string }[];
  storyId?: string;
  uploadedBy: string;
  createdAt: Timestamp;
}
