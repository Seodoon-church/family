import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDF_COLORS, PDF_FONTS, PAGE_MARGIN } from "@/lib/pdf-theme";

const styles = StyleSheet.create({
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONTS.heading,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
    marginBottom: 20,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: PDF_COLORS.border,
  },
  dividerSymbol: {
    marginHorizontal: 10,
    fontSize: 10,
    color: PDF_COLORS.gold,
    fontFamily: PDF_FONTS.body,
  },
  pageBase: {
    paddingTop: PAGE_MARGIN.top,
    paddingBottom: PAGE_MARGIN.bottom,
    paddingLeft: PAGE_MARGIN.left,
    paddingRight: PAGE_MARGIN.right,
    backgroundColor: PDF_COLORS.background,
    fontFamily: PDF_FONTS.body,
  },
});

export function PdfPageNumber({ pageNumber }: { pageNumber?: number }) {
  return (
    <Text style={styles.pageNumber} render={({ pageNumber: pn }) => `— ${pageNumber ?? pn} —`} />
  );
}

export function PdfSectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export function PdfOrnamentDivider({ symbol = "◆" }: { symbol?: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerSymbol}>{symbol}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export { styles as pdfBaseStyles };
