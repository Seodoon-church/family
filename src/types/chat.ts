import type { Timestamp } from "firebase/firestore";

export type MessageType = "TEXT" | "IMAGE" | "SYSTEM";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  type: MessageType;
  imageUrl?: string;
  createdAt: Timestamp;
}
