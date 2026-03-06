import { Timestamp } from "firebase/firestore";

export type StoryCategory =
  | "MEMORY"
  | "RECIPE"
  | "TRADITION"
  | "WISDOM"
  | "MILESTONE"
  | "DAILY"
  | "TRAVEL"
  | "CELEBRATION";

export interface Story {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  authorName: string;
  category: StoryCategory;
  storyDate?: Timestamp;
  mentionedMembers: { id: string; name: string }[];
  mediaUrls: { url: string; type: string; thumbnail?: string }[];
  isPinned: boolean;
  commentCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  parentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
