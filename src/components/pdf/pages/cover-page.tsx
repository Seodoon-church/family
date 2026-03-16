import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDF_COLORS, PDF_FONTS } from "@/lib/pdf-theme";

const styles = StyleSheet.create({
  page: {
    backgroundColor: PDF_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  border: {
    border: `2pt solid ${PDF_COLORS.gold}`,
    borderRadius: 4,
    padding: 40,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  stamp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    border: `2pt solid ${PDF_COLORS.primary}`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  stampText: {
    fontSize: 28,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONTS.heading,
    fontWeight: 700,
  },
  familyName: {
    fontSize: 32,
    fontWeight: 700,
    color: PDF_COLORS.foreground,
    fontFamily: PDF_FONTS.story,
    marginBottom: 8,
  },
  year: {
    fontSize: 16,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONTS.heading,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 14,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.story,
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONTS.heading,
  },
  statLabel: {
    fontSize: 8,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 80,
    fontSize: 8,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
  },
});

interface CoverPageProps {
  familyName: string;
  year: number;
  memberCount: number;
  storyCount: number;
  photoCount: number;
}

export function CoverPage({ familyName, year, memberCount, storyCount, photoCount }: CoverPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.stamp}>
          <Text style={styles.stampText}>家</Text>
        </View>
        <Text style={styles.familyName}>{familyName}</Text>
        <Text style={styles.year}>{year}년 연간 다이어리</Text>
        <Text style={styles.subtitle}>한 해의 소중한 이야기들</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{memberCount}</Text>
            <Text style={styles.statLabel}>가족</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{storyCount}</Text>
            <Text style={styles.statLabel}>이야기</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{photoCount}</Text>
            <Text style={styles.statLabel}>사진</Text>
          </View>
        </View>
      </View>
      <Text style={styles.footer}>우리家 이야기</Text>
    </Page>
  );
}
