// 백업/복원 시스템 타입 정의

export interface BackupManifest {
  version: string;
  createdAt: string; // ISO8601
  generator: string;
  familyId: string;
  familyName: string;
  exportedBy: {
    userId: string;
    displayName: string;
    email: string;
  };
  stats: BackupStats;
  checksum?: string;
}

export interface BackupStats {
  memberCount: number;
  storyCount: number;
  mediaCount: number;
  mediaSize: number; // bytes
  eventCount: number;
  relationshipCount: number;
  messageCount: number;
}

export interface BackupFamily {
  id: string;
  name: string;
  description?: string;
  surname?: string;
  clan?: string;
  branch?: string;
  inviteCode?: string;
  createdBy: string;
  createdAt: string;
  settings?: {
    isPublic?: boolean;
    allowMemberInvite?: boolean;
    defaultLanguage?: string;
  };
}

export interface BackupMember {
  id: string;
  nameKorean: string;
  nameHanja?: string;
  nameFull?: string;
  gender: "MALE" | "FEMALE";
  birthDate?: string;
  birthDateLunar?: string;
  deathDate?: string;
  isAlive: boolean;
  generation: number;
  birthOrder: number;
  generationName?: string;
  generationCount?: number;
  profileImage?: string;
  bio?: string;
  occupation?: string;
  education?: string;
  birthPlace?: string;
  currentPlace?: string;
  linkedUserId?: string | null;
  surname?: string;
  clan?: string;
  branch?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackupRelationship {
  id: string;
  type: "PARENT_CHILD" | "SPOUSE";
  fromId: string;
  toId: string;
  marriageDate?: string;
  createdAt?: string;
}

export type StoryCategory =
  | "MEMORY" | "RECIPE" | "TRADITION" | "WISDOM"
  | "MILESTONE" | "DAILY" | "TRAVEL" | "CELEBRATION"
  | "HISTORY" | "LETTER" | "DIARY" | "OTHER";

export interface BackupStory {
  id: string;
  title: string;
  content: string;
  contentMarkdown?: string;
  excerpt?: string;
  category: StoryCategory;
  authorId: string;
  authorName: string;
  storyDate?: string;
  mentionedMembers?: string[];
  mediaUrls?: string[];
  isPinned?: boolean;
  viewCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BackupMedia {
  id: string;
  type: "PHOTO" | "VIDEO" | "AUDIO" | "DOCUMENT";
  fileName: string;
  originalName?: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  title?: string;
  description?: string;
  dateTaken?: string;
  location?: string;
  taggedMembers?: string[];
  uploadedBy: string;
  createdAt: string;
}

export type EventType =
  | "BIRTH" | "DEATH" | "MARRIAGE" | "GRADUATION"
  | "CAREER" | "ANNIVERSARY" | "HOLIDAY" | "REUNION"
  | "TRAVEL" | "OTHER";

export interface BackupEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  isLunar?: boolean;
  isRecurring: boolean;
  description?: string;
  location?: string;
  relatedMemberId?: string;
  participants?: { id: string; name: string }[];
  createdAt: string;
}

export interface BackupMessage {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
  type: "TEXT" | "IMAGE" | "SYSTEM";
  createdAt: string;
}

export interface FullBackupData {
  manifest: BackupManifest;
  family: BackupFamily;
  members: BackupMember[];
  relationships: BackupRelationship[];
  stories: BackupStory[];
  events: BackupEvent[];
  media: BackupMedia[];
  messages?: BackupMessage[];
}

export interface ExportOptions {
  includeMedia: boolean;
  includeMessages: boolean;
  mediaQuality: "original" | "compressed";
}

export interface ImportOptions {
  mergeMode: "overwrite" | "merge" | "skip";
  importMedia: boolean;
}

export interface ImportResult {
  success: boolean;
  stats: {
    membersImported: number;
    storiesImported: number;
    mediaImported: number;
    eventsImported: number;
    relationshipsImported: number;
    messagesImported: number;
    skipped: number;
    errors: string[];
  };
}
