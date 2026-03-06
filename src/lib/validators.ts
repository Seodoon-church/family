import { z } from "zod";

export const memberSchema = z.object({
  nameKorean: z.string().min(1, "이름을 입력해주세요"),
  nameHanja: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"], { message: "성별을 선택해주세요" }),
  birthDate: z.string().optional(),
  birthDateLunar: z.string().optional(),
  deathDate: z.string().optional(),
  isAlive: z.boolean().default(true),
  generation: z.number().int().min(0, "세대는 0 이상이어야 합니다"),
  birthOrder: z.number().int().min(1, "출생 순서는 1 이상이어야 합니다"),
  clan: z.string().optional(),
  bio: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  birthPlace: z.string().optional(),
  currentPlace: z.string().optional(),
});

export const storySchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자 이내로 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  category: z.enum([
    "MEMORY",
    "RECIPE",
    "TRADITION",
    "WISDOM",
    "MILESTONE",
    "DAILY",
    "TRAVEL",
    "CELEBRATION",
  ]),
  storyDate: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "날짜를 선택해주세요"),
  eventDateLunar: z.string().optional(),
  category: z.enum([
    "BIRTH",
    "DEATH",
    "MARRIAGE",
    "GRADUATION",
    "CAREER",
    "ANNIVERSARY",
    "HOLIDAY",
    "REUNION",
    "TRAVEL",
    "OTHER",
  ]),
  isRecurring: z.boolean().default(false),
  location: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export type MemberFormData = z.infer<typeof memberSchema>;
export type StoryFormData = z.infer<typeof storySchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
