// app/api/events/route.ts
import { NextResponse } from "next/server";
import IcalExpander from "ical-expander";

const DAYS_AHEAD = parseInt(process.env.DAYS_AHEAD || "30", 10); // configurable

async function fetchIcs(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ICS: ${res.status}`);
  return await res.text();
}

export async function GET() {
  try {
    const raw = process.env.ICS_URLS?.trim();
    if (!raw) {
      return NextResponse.json({ events: [], error: "ICS_URLS not set" }, { status: 200 });
    }

    const icsUrls = raw.split(",").map(s => s.trim()).filter(Boolean);
    const now = new Date();
    const rangeEnd = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

    // Fetch in parallel
    const icsTexts = await Promise.all(icsUrls.map(fetchIcs));

    // Parse & expand all calendars, then merge
    const merged: {
      start: string;
      end: string;
      title: string;
      location?: string;
      description?: string;
      sourceIndex: number; // which ICS it came from
    }[] = [];

    icsTexts.forEach((icsText, idx) => {
      const expander = new IcalExpander({ ics: icsText, maxIterations: 2000 });
      const { events, occurrences } = expander.between(now, rangeEnd);

      // Single (non-recurring) events
      for (const ev of events) {
        merged.push({
          start: ev.startDate.toJSDate().toISOString(),
          end: ev.endDate.toJSDate().toISOString(),
          title: ev.summary || "(No title)",
          location: ev.location || undefined,
          description: ev.description || undefined,
          sourceIndex: idx,
        });
      }

      // Recurring instances
      for (const occ of occurrences) {
        merged.push({
          start: occ.startDate.toJSDate().toISOString(),
          end: occ.endDate.toJSDate().toISOString(),
          title: occ.item.summary || "(No title)",
          location: occ.item.location || undefined,
          description: occ.item.description || undefined,
          sourceIndex: idx,
        });
      }
    });

    // Sort by start time
    merged.sort((a, b) => +new Date(a.start) - +new Date(b.start));

    return NextResponse.json({ events: merged });
  } catch (e: any) {
    return NextResponse.json({ events: [], error: e.message || "Unknown error" }, { status: 200 });
  }
}
