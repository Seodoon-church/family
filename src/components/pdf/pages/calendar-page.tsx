import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDF_COLORS, PDF_FONTS, PAGE_MARGIN, KOREAN_MONTHS, KOREAN_DAYS } from "@/lib/pdf-theme";
import { getCalendarGrid } from "@/lib/pdf-utils";
import { PdfPageNumber } from "../shared/pdf-ornament";

const CELL_H = 70;

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: PAGE_MARGIN.bottom,
    paddingLeft: 30,
    paddingRight: 30,
    backgroundColor: PDF_COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  monthText: {
    fontSize: 28,
    fontWeight: 700,
    color: PDF_COLORS.primary,
    fontFamily: PDF_FONTS.heading,
  },
  yearText: {
    fontSize: 10,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
    marginBottom: 4,
  },
  dayHeaders: {
    flexDirection: "row",
    borderBottom: `1pt solid ${PDF_COLORS.border}`,
    paddingBottom: 4,
    marginBottom: 2,
  },
  dayHeader: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 8,
    fontWeight: 700,
    fontFamily: PDF_FONTS.heading,
  },
  weekRow: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${PDF_COLORS.border}`,
  },
  cell: {
    width: `${100 / 7}%`,
    height: CELL_H,
    padding: 3,
  },
  dayNumber: {
    fontSize: 10,
    fontFamily: PDF_FONTS.body,
    fontWeight: 700,
    marginBottom: 2,
  },
  eventDot: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 3,
  },
  eventText: {
    fontSize: 5.5,
    fontFamily: PDF_FONTS.body,
    color: PDF_COLORS.foreground,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 7,
    color: PDF_COLORS.muted,
    fontFamily: PDF_FONTS.body,
  },
});

export interface CalendarEvent {
  day: number;
  label: string;
  color: string; // hex color for dot
}

interface CalendarPageProps {
  year: number;
  month: number; // 0-based
  events: CalendarEvent[];
}

export function CalendarPage({ year, month, events }: CalendarPageProps) {
  const grid = getCalendarGrid(year, month);

  // 날짜별 이벤트 맵
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const ev of events) {
    if (!eventsByDay[ev.day]) eventsByDay[ev.day] = [];
    eventsByDay[ev.day].push(ev);
  }

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.monthText}>{KOREAN_MONTHS[month]}</Text>
        <Text style={styles.yearText}>{year}</Text>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.dayHeaders}>
        {KOREAN_DAYS.map((d, i) => (
          <Text
            key={d}
            style={[
              styles.dayHeader,
              { color: i === 0 ? PDF_COLORS.sunday : i === 6 ? PDF_COLORS.saturday : PDF_COLORS.foreground },
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* 달력 그리드 */}
      {grid.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            const dayColor = di === 0 ? PDF_COLORS.sunday : di === 6 ? PDF_COLORS.saturday : PDF_COLORS.foreground;
            const dayEvents = day ? (eventsByDay[day] || []) : [];

            return (
              <View key={di} style={styles.cell}>
                {day && (
                  <>
                    <Text style={[styles.dayNumber, { color: dayColor }]}>{day}</Text>
                    {dayEvents.slice(0, 3).map((ev, ei) => (
                      <View key={ei} style={styles.eventDot}>
                        <View style={[styles.dot, { backgroundColor: ev.color }]} />
                        <Text style={styles.eventText}>{ev.label}</Text>
                      </View>
                    ))}
                    {dayEvents.length > 3 && (
                      <Text style={[styles.eventText, { color: PDF_COLORS.muted }]}>
                        +{dayEvents.length - 3}
                      </Text>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PDF_COLORS.primary }]} />
          <Text style={styles.legendText}>생일</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PDF_COLORS.gold }]} />
          <Text style={styles.legendText}>기념일</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PDF_COLORS.male }]} />
          <Text style={styles.legendText}>이벤트</Text>
        </View>
      </View>

      <PdfPageNumber />
    </Page>
  );
}
