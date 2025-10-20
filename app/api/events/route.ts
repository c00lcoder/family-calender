// app/api/events/route.ts
import { NextResponse } from "next/server";
import IcalExpander from "ical-expander";

const DAYS_AHEAD = parseInt(process.env.DAYS_AHEAD || "30", 10); // configurable

async function fetchIcs(url: string): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Race fetch against a timeout
      const fetchPromise = fetch(url, { cache: "no-store" });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 15s')), 15000)
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();

      // Validate it's actually ICS data
      if (!text.includes('BEGIN:VCALENDAR')) {
        throw new Error('Response does not contain valid ICS calendar data');
      }

      console.log(`✓ Successfully fetched ICS (${text.length} bytes, attempt ${attempt})`);
      return text;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.error(`✗ Attempt ${attempt}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries) {
        const waitTime = attempt * 1000; // 1s, 2s
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  const errorMsg = `Failed to fetch ICS after ${maxRetries} attempts${lastError ? ': ' + lastError.message : ''}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

export async function GET() {
  try {
    const raw = process.env.ICS_URLS?.trim();
    if (!raw) {
      console.warn("ICS_URLS environment variable not set");
      return NextResponse.json({ events: [], error: "ICS_URLS not set" }, { status: 200 });
    }

    const icsUrls = raw.split(",").map(s => s.trim()).filter(Boolean);
    if (icsUrls.length === 0) {
      console.warn("No valid ICS URLs found");
      return NextResponse.json({ events: [], error: "No valid ICS URLs" }, { status: 200 });
    }

    const now = new Date();
    const rangeEnd = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

    // Fetch in parallel with individual error handling
    const icsResults = await Promise.allSettled(icsUrls.map(fetchIcs));

    // Parse & expand all calendars, then merge
    const merged: {
      start: string;
      end: string;
      title: string;
      location?: string;
      description?: string;
      sourceIndex: number; // which ICS it came from
    }[] = [];

    let successCount = 0;
    let failCount = 0;

    icsResults.forEach((result, idx) => {
      if (result.status === 'rejected') {
        console.error(`Failed to fetch calendar ${idx}:`, result.reason);
        failCount++;
        return;
      }

      const icsText = result.value;

      try {
        const expander = new IcalExpander({ ics: icsText, maxIterations: 2000 });
        const { events, occurrences } = expander.between(now, rangeEnd);

        // Single (non-recurring) events
        for (const ev of events) {
          try {
            merged.push({
              start: ev.startDate.toJSDate().toISOString(),
              end: ev.endDate.toJSDate().toISOString(),
              title: ev.summary || "(No title)",
              location: ev.location || undefined,
              description: ev.description || undefined,
              sourceIndex: idx,
            });
          } catch (e) {
            console.error(`Error processing event from calendar ${idx}:`, e);
            // Skip this individual event but continue processing
          }
        }

        // Recurring instances
        for (const occ of occurrences) {
          try {
            merged.push({
              start: occ.startDate.toJSDate().toISOString(),
              end: occ.endDate.toJSDate().toISOString(),
              title: occ.item.summary || "(No title)",
              location: occ.item.location || undefined,
              description: occ.item.description || undefined,
              sourceIndex: idx,
            });
          } catch (e) {
            console.error(`Error processing recurring event from calendar ${idx}:`, e);
            // Skip this individual event but continue processing
          }
        }

        successCount++;
      } catch (e) {
        console.error(`Error parsing calendar ${idx}:`, e);
        failCount++;
        // Continue with other calendars
      }
    });

    // Sort by start time
    merged.sort((a, b) => +new Date(a.start) - +new Date(b.start));

    console.log(`Successfully processed ${successCount}/${icsUrls.length} calendars, ${merged.length} events total`);

    // Return events even if some calendars failed (fault tolerant)
    if (successCount === 0 && failCount > 0) {
      return NextResponse.json({
        events: [],
        error: `All ${failCount} calendar(s) failed to load`
      }, { status: 200 });
    }

    return NextResponse.json({
      events: merged,
      ...(failCount > 0 && { warning: `${failCount} calendar(s) failed to load` })
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    console.error("Fatal error in events API:", errorMessage);
    return NextResponse.json({ events: [], error: errorMessage }, { status: 200 });
  }
}
