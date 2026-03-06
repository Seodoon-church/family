import { Timestamp } from "firebase/firestore";

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface FamilyMember {
  id: string;
  nameKorean: string;
  nameHanja?: string;
  nameFull?: string;
  gender: "MALE" | "FEMALE";
  birthDate?: Timestamp;
  birthDateLunar?: string;
  deathDate?: Timestamp;
  isAlive: boolean;
  generation: number;
  birthOrder: number;
  clan?: string;
  profileImage?: string;
  bio?: string;
  occupation?: string;
  education?: string;
  birthPlace?: string;
  currentPlace?: string;
  linkedUserId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: "PARENT_CHILD" | "SPOUSE";
  marriageDate?: Timestamp;
  createdAt: Timestamp;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profileImage?: string;
  familyId: string;
  memberId?: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
  createdAt: Timestamp;
}
