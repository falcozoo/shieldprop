/**
 * ShieldProp — Economic calendar data layer.
 *
 * Source: Forex Factory free JSON feed (this week / next week).
 * This module is the ONLY place that knows about the upstream source, so the
 * provider can be swapped later (paid API) without touching the UI.
 *
 * Compliance note: this is an INFORMATIONAL aid. We classify public
 * macro-event impact into risk windows ("elevated", "caution", "clear").
 * We never tell the user to buy/sell or guarantee any outcome.
 */

export type Impact = "High" | "Medium" | "Low" | "Holiday";
export type RiskLevel = "elevated" | "caution" | "clear";

export interface RawEvent {
  title: string;
  country: string; // currency code, e.g. "USD"
  date: string; // ISO with offset, e.g. "2026-08-16T18:30:00-04:00"
  impact: string;
  forecast: string;
  previous: string;
}

export interface CalEvent {
  id: string;
  title: string;
  currency: string;
  /** ISO 8601 UTC timestamp */
  time: string;
  impact: Impact;
  risk: RiskLevel;
  forecast: string;
  previous: string;
}

const THIS_WEEK = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const NEXT_WEEK = "https://nfs.faireconomy.media/ff_calendar_nextweek.json";

/** Currencies we surface by default (majors + CNY). */
export const MAJOR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "NZD",
  "CNY",
];

function normalizeImpact(raw: string): Impact {
  const v = (raw || "").toLowerCase();
  if (v.includes("high")) return "High";
  if (v.includes("medium")) return "Medium";
  if (v.includes("holiday")) return "Holiday";
  return "Low";
}

function riskFromImpact(impact: Impact): RiskLevel {
  if (impact === "High") return "elevated";
  if (impact === "Medium") return "caution";
  return "clear";
}

function stableId(e: RawEvent): string {
  // Deterministic id so the client can dedupe/key safely.
  return `${e.date}|${e.country}|${e.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80);
}

async function fetchFeed(url: string): Promise<RawEvent[]> {
  const res = await fetch(url, {
    headers: {
      // FF feed rejects empty UA
      "User-Agent":
        "Mozilla/5.0 (compatible; ShieldPropBot/1.0; +https://shieldprop.io)",
      Accept: "application/json",
    },
    // Revalidate hourly — macro calendar does not change intraday.
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Calendar feed ${url} returned ${res.status}`);
  }
  const data = (await res.json()) as RawEvent[];
  if (!Array.isArray(data)) throw new Error("Calendar feed: unexpected shape");
  return data;
}

/**
 * Fetch one feed but never throw: a missing/late feed (e.g. next-week not yet
 * published → 404) must not take down the whole calendar. Returns [] on failure.
 */
async function fetchFeedSafe(url: string): Promise<RawEvent[]> {
  try {
    return await fetchFeed(url);
  } catch {
    return [];
  }
}

/**
 * Fetch + normalise this week (and optionally next week) of macro events.
 * Returns events sorted ascending by time, filtered to major currencies.
 */
export async function getEvents(
  opts: { includeNextWeek?: boolean; minImpact?: "High" | "Medium" | "Low" } = {},
): Promise<CalEvent[]> {
  const { includeNextWeek = true, minImpact = "Low" } = opts;

  const urls = includeNextWeek ? [THIS_WEEK, NEXT_WEEK] : [THIS_WEEK];
  const results = await Promise.all(urls.map(fetchFeedSafe));
  const raws = results.flat();

  // If everything failed (both feeds down), signal unavailable to the caller.
  if (raws.length === 0) {
    throw new Error("Calendar feeds unavailable");
  }

  const impactRank: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
  const floor = impactRank[minImpact] ?? 0;

  const seen = new Set<string>();
  const events: CalEvent[] = [];

  for (const e of raws) {
    if (!e || !e.date || !e.country) continue;
    if (!MAJOR_CURRENCIES.includes(e.country)) continue;

    const impact = normalizeImpact(e.impact);
    if (impact !== "Holiday" && (impactRank[impact] ?? 0) < floor) continue;

    const time = new Date(e.date);
    if (isNaN(time.getTime())) continue;

    const id = stableId(e);
    if (seen.has(id)) continue;
    seen.add(id);

    events.push({
      id,
      title: e.title,
      currency: e.country,
      time: time.toISOString(),
      impact,
      risk: riskFromImpact(impact),
      forecast: e.forecast || "",
      previous: e.previous || "",
    });
  }

  events.sort((a, b) => a.time.localeCompare(b.time));
  return events;
}
