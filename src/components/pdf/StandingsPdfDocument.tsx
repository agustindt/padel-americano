import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { StandingRow } from "@/lib/standings";
import { BRAND_NAME } from "@/lib/brand";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1f1a",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2d5a3d",
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica",
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#1e3d28",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 9,
    color: "#5c665e",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#c5cdc7",
    paddingBottom: 6,
    marginBottom: 4,
    fontFamily: "Helvetica",
    fontWeight: 700,
    fontSize: 9,
    color: "#3d4a40",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8ebe9",
  },
  colRank: { width: "8%" },
  colName: { width: "38%" },
  colNum: { width: "9%", textAlign: "center" as const },
  colPts: { width: "12%", textAlign: "right" as const },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#8a9390",
    textAlign: "center",
  },
});

function fmtPct(played: number, winRate: number | null): string {
  if (played === 0 || winRate === null) return "—";
  return `${Math.round(winRate * 100)}%`;
}

export function StandingsPdfDocument({
  standings,
  generatedAt,
  minGamesLabel,
}: {
  standings: StandingRow[];
  generatedAt: Date;
  minGamesLabel: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{BRAND_NAME}</Text>
          <Text style={styles.subtitle}>Tabla de posiciones · {minGamesLabel}</Text>
          <Text style={styles.subtitle}>
            Generado {generatedAt.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colRank}>#</Text>
          <Text style={styles.colName}>Jugador</Text>
          <Text style={styles.colNum}>PJ</Text>
          <Text style={styles.colNum}>%</Text>
          <Text style={styles.colNum}>G</Text>
          <Text style={styles.colNum}>P</Text>
          <Text style={styles.colNum}>E</Text>
          <Text style={styles.colPts}>Pts</Text>
        </View>

        {standings.map((row, i) => (
          <View key={row.userId} style={styles.row} wrap={false}>
            <Text style={styles.colRank}>{i + 1}</Text>
            <Text style={styles.colName}>{row.name}</Text>
            <Text style={styles.colNum}>{row.played}</Text>
            <Text style={styles.colNum}>{fmtPct(row.played, row.winRate)}</Text>
            <Text style={styles.colNum}>{row.wins}</Text>
            <Text style={styles.colNum}>{row.losses}</Text>
            <Text style={styles.colNum}>{row.draws}</Text>
            <Text style={styles.colPts}>{row.points}</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Solo cuentan partidos de fechas confirmadas o jugadas (no borradores). Mejor de tres sets o un set.
        </Text>
      </Page>
    </Document>
  );
}
