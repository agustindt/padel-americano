/** Genera contenido iCalendar (RFC 5545) para suscripción en Google Calendar / Apple Calendar. */

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatUtc(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  const h = String(dt.getUTCHours()).padStart(2, "0");
  const min = String(dt.getUTCMinutes()).padStart(2, "0");
  const sec = String(dt.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}${sec}Z`;
}

export type IcsRound = {
  id: string;
  title: string | null;
  scheduledAt: Date | null;
  venue: string | null;
};

export function buildGroupCalendarIcs(opts: { calname: string; rounds: IcsRound[] }): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Americano//ES",
    `X-WR-CALNAME:${escapeText(opts.calname)}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const r of opts.rounds) {
    if (!r.scheduledAt) continue;
    const start = r.scheduledAt;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const uid = `${r.id}@padel-americano.local`;
    const summary = r.title?.trim() || "Fecha americano";
    let desc = "Americano — padel";
    if (r.venue) desc += ` · ${r.venue}`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${formatUtc(new Date())}`);
    lines.push(`DTSTART:${formatUtc(start)}`);
    lines.push(`DTEND:${formatUtc(end)}`);
    lines.push(`SUMMARY:${escapeText(summary)}`);
    lines.push(`DESCRIPTION:${escapeText(desc)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
