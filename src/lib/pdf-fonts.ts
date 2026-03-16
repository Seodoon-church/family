import { Font } from "@react-pdf/renderer";

// Noto Sans KR — UI 텍스트용
Font.register({
  family: "Noto Sans KR",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/nicholasgasior/gfonts-woff2@master/NotoSansKR-Regular.woff2",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/nicholasgasior/gfonts-woff2@master/NotoSansKR-Bold.woff2",
      fontWeight: 700,
    },
  ],
});

// Noto Serif KR — 이야기 콘텐츠용
Font.register({
  family: "Noto Serif KR",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/nicholasgasior/gfonts-woff2@master/NotoSerifKR-Regular.woff2",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/nicholasgasior/gfonts-woff2@master/NotoSerifKR-Bold.woff2",
      fontWeight: 700,
    },
  ],
});

// 한글 하이픈 방지
Font.registerHyphenationCallback((word: string) => [word]);
