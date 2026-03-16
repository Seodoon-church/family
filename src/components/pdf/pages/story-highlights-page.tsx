import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDF_COLORS, PDF_FONTS, PAGE_MARGIN, KOREAN_MONTHS, CATEGORY_LABELS } from "@/lib/pdf-theme";
import { PdfPageNumber, PdfOrnamentDivider } from "../shared/pdf-ornament";

const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE_MARGIN.top,
    paddingBottom: PAGE_MARGIN.bottom,
    paddingLeft: PAGE_MARGIN.left,
    paddingRight: PAGE_MARGIN.right,
    backgroundColor: PDF_COLORS.background,
  },
  monthHeader: {
    fontSize: 14,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONTS.heading,
    marginBottom: 12,
  },
  storyCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: PDF_COLORS.card,
    borderRadius: 6,
    border: `0.5pt solid ${PDF_COLORS.border}`,
  },
  storyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: PDF_COLORS.foreground,
    fontFamily: PDF_FONTS.story,
    flex: 1,
  },
  categoryBadge: {
    fontSize: 6,
    color: PDF_COLORS.white,
    backgroundColor: PDF_COLORS.primary,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  storyExcerpt: {
    fontSize: 8.5,
    color: PDF_COLORS.foreground,
    fontFamily: PDF_FONTS.story,
    lineHeight: 1.5,
    marginTop: 4,
  },
  storyMeta: {
    fontSize: 7,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
    marginTop: 4,
  },
});

export interface ProcessedStory {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  date: string; // formatted date string
  month: number; // 0-based
}

interface StoryHighlightsPageProps {
  month: number;
  stories: ProcessedStory[];
}

export function StoryHighlightsPage({ month, stories }: StoryHighlightsPageProps) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <Text style={styles.monthHeader}>{KOREAN_MONTHS[month]}의 이야기</Text>
      {stories.map((story, i) => (
        <View key={story.id} wrap={false}>
          {i > 0 && <PdfOrnamentDivider symbol="·" />}
          <View style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.categoryBadge}>
                {CATEGORY_LABELS[story.category] || story.category}
              </Text>
            </View>
            <Text style={styles.storyExcerpt}>{story.excerpt}</Text>
            <Text style={styles.storyMeta}>
              {story.authorName} · {story.date}
            </Text>
          </View>
        </View>
      ))}
      <PdfPageNumber />
    </Page>
  );
}
