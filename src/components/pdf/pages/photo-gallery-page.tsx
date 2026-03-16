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
    gap: 8,
    marginTop: 10,
  },
  photoHalf: {
    width: "48%",
    height: 200,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: PDF_COLORS.card,
    border: `0.5pt solid ${PDF_COLORS.border}`,
  },
  photoImage: {
    width: "100%",
    height: 170,
    objectFit: "cover",
  },
  photoCaption: {
    fontSize: 7,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
    padding: 4,
    textAlign: "center",
  },
});

export interface ProcessedPhoto {
  id: string;
  dataUrl: string;
  caption: string;
}

interface PhotoGalleryPageProps {
  photos: ProcessedPhoto[];
  isFirstPage?: boolean;
}

export function PhotoGalleryPage({ photos, isFirstPage }: PhotoGalleryPageProps) {
  return (
    <Page size="A4" style={styles.page} wrap>
      {isFirstPage && <PdfSectionTitle title="올해의 사진" subtitle="소중한 순간들을 담다" />}
      <View style={styles.grid}>
        {photos.map((photo) => (
          <View key={photo.id} style={styles.photoHalf} wrap={false}>
            <Image src={photo.dataUrl} style={styles.photoImage} />
            <Text style={styles.photoCaption}>{photo.caption}</Text>
          </View>
        ))}
      </View>
      <PdfPageNumber />
    </Page>
  );
}
