import { Timestamp } from "firebase/firestore";

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Timestamp;
  // 족보 정보
  surname?: string;              // 성씨 (한)
  clan?: string;                 // 본관 (청주)
  branch?: string;               // 파
  referenceGeneration?: number;  // 기준 세대 인덱스 (0-based)
  referenceGenerationCount?: number; // 기준 대손
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
  surname?: string;        // 성씨 (김, 이, 박 등)
  clan?: string;           // 본관 (김해, 경주, 밀양 등)
  branch?: string;         // 파 (충의공파, 문경공파 등)
  generationName?: string; // 항렬자
  generationCount?: number; // 몇 대손
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
  familyId?: string;
  memberId?: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  createdAt: Timestamp;
}
