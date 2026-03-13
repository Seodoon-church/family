export const RELATIONSHIP_TYPES = {
  PARENT_CHILD: "PARENT_CHILD",
  SPOUSE: "SPOUSE",
} as const;

export const GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export const USER_ROLES = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
} as const;

export const STORY_CATEGORIES = {
  MEMORY: { value: "MEMORY", label: "추억", icon: "Heart" },
  RECIPE: { value: "RECIPE", label: "레시피", icon: "ChefHat" },
  TRADITION: { value: "TRADITION", label: "가풍/전통", icon: "ScrollText" },
  WISDOM: { value: "WISDOM", label: "어른 말씀", icon: "Quote" },
  MILESTONE: { value: "MILESTONE", label: "이정표", icon: "Trophy" },
  DAILY: { value: "DAILY", label: "일상", icon: "Sun" },
  TRAVEL: { value: "TRAVEL", label: "여행", icon: "Plane" },
  CELEBRATION: { value: "CELEBRATION", label: "경조사", icon: "PartyPopper" },
} as const;

export const EVENT_CATEGORIES = {
  BIRTH: { value: "BIRTH", label: "출생", icon: "Baby" },
  DEATH: { value: "DEATH", label: "기일", icon: "Flower2" },
  MARRIAGE: { value: "MARRIAGE", label: "결혼", icon: "Heart" },
  GRADUATION: { value: "GRADUATION", label: "졸업", icon: "GraduationCap" },
  CAREER: { value: "CAREER", label: "취직/승진", icon: "Briefcase" },
  ANNIVERSARY: { value: "ANNIVERSARY", label: "기념일", icon: "Calendar" },
  HOLIDAY: { value: "HOLIDAY", label: "명절", icon: "Home" },
  REUNION: { value: "REUNION", label: "가족 모임", icon: "Users" },
  TRAVEL: { value: "TRAVEL", label: "가족 여행", icon: "Plane" },
  OTHER: { value: "OTHER", label: "기타", icon: "Star" },
} as const;

export const MEDIA_TYPES = {
  PHOTO: "PHOTO",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
} as const;

export const MEDIA_MAX_SIZES = {
  PHOTO: 20 * 1024 * 1024,    // 20MB
  VIDEO: 500 * 1024 * 1024,   // 500MB
  AUDIO: 50 * 1024 * 1024,    // 50MB
} as const;

export const RELATIONSHIP_LABELS: Record<string, Record<string, string>> = {
  PARENT_CHILD: {
    MALE_TO: "아버지",
    FEMALE_TO: "어머니",
    TO_MALE: "아들",
    TO_FEMALE: "딸",
  },
  SPOUSE: {
    MALE_TO: "남편",
    FEMALE_TO: "아내",
  },
};

export const THEME_COLORS = {
  primary: {
    50: "#FBF5F0",
    100: "#F5E8DC",
    200: "#EACDB5",
    300: "#D9A98A",
    400: "#C48262",
    500: "#A0604B",
    600: "#8B4D3B",
    700: "#73392D",
    800: "#5C2C22",
    900: "#4A2019",
  },
  accent: {
    red: "#C94040",
    blue: "#4A7A9B",
    green: "#5E8A5E",
    gold: "#C8920A",
    cream: "#FAF7F2",
  },
} as const;
