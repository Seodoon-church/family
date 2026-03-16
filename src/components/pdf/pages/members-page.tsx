import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { PDF_COLORS, PDF_FONTS, PAGE_MARGIN } from "@/lib/pdf-theme";
import { PdfSectionTitle, PdfPageNumber } from "../shared/pdf-ornament";

const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE_MARGIN.top,
    paddingBottom: PAGE_MARGIN.bottom,
    paddingLeft: PAGE_MARGIN.left,
    paddingRight: PAGE_MARGIN.right,
    backgroundColor: PDF_COLORS.background,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  card: {
    width: "30%",
    alignItems: "center",
    padding: 10,
    backgroundColor: PDF_COLORS.card,
    borderRadius: 8,
    border: `0.5pt solid ${PDF_COLORS.border}`,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 6,
  },
  name: {
    fontSize: 10,
    fontWeight: 700,
    color: PDF_COLORS.foreground,
    fontFamily: PDF_FONTS.heading,
    textAlign: "center",
  },
  info: {
    fontSize: 7,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
    marginTop: 2,
    textAlign: "center",
  },
});

export interface ProcessedMember {
  id: string;
  nameKorean: string;
  gender: "MALE" | "FEMALE";
  generation: number;
  birthYear?: number;
  isAlive: boolean;
  avatarDataUrl: string;
}

interface MembersPageProps {
  members: ProcessedMember[];
}

export function MembersPage({ members }: MembersPageProps) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <PdfSectionTitle title="등장인물" subtitle="이 이야기에 등장하는 사람들" />
      <View style={styles.grid}>
        {members.map((m) => (
          <View key={m.id} style={styles.card}>
            <Image src={m.avatarDataUrl} style={styles.avatar} />
            <Text style={styles.name}>{m.nameKorean}</Text>
            <Text style={styles.info}>
              {m.generation + 1}세대{m.birthYear ? ` · ${m.birthYear}년생` : ""}
              {!m.isAlive ? " · 작고" : ""}
            </Text>
          </View>
        ))}
      </View>
      <PdfPageNumber />
    </Page>
  );
}
