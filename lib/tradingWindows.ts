/**
 * ShieldProp — Trading-window engine.
 *
 * Cross-references the user's selected prop firms (each with a funded/eval flag)
 * against today's high-impact economic events, and produces MERGED blackout
 * windows: the moment a SINGLE selected firm blocks trading, the whole verdict
 * is "DO NOT TRADE" (most-conservative merge — the target user runs copiers
 * across many accounts, so any block = block everywhere).
 *
 * Compliance: informational aid only. We surface each firm's published policy;
 * the user must always confirm their own firm's current rules.
 */

import type { CalEvent } from "./calendar";
import { getFirm, type FirmRule } from "./firms";

/**
 * Given an anchor ISO timestamp (any instant on the target calendar day) and a
 * wall-clock time "HH:MM" in US Eastern, return the UTC epoch ms for that ET
 * wall-clock time on the SAME ET calendar day as the anchor. Handles EST/EDT
 * automatically via Intl (no hard-coded offset).
 */
function etTimeToUtcMsOnSameDay(anchorIso: string, hhmm: string): number {
  const anchor = new Date(anchorIso);
  // ET calendar date parts for the anchor instant.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(anchor);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const y = get("year");
  const m = get("month");
  const d = get("day");
  const [hh, mm] = hhmm.split(":");
  // Build the ET wall-clock instant, then resolve its true UTC by measuring the
  // zone offset at that moment.
  const naiveUtc = Date.parse(`${y}-${m}-${d}T${hh}:${mm}:00Z`);
  const offsetMin = etOffsetMinutes(new Date(naiveUtc));
  return naiveUtc - offsetMin * 60_000;
}

/** ET UTC-offset in minutes (negative west of UTC) for a given instant. */
function etOffsetMinutes(at: Date): number {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  // e.g. "GMT-4" or "GMT-5"
  const match = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(s ?? "");
  if (!match) return -300; // fallback EST
  const hrs = parseInt(match[1], 10);
  const mins = match[2] ? parseInt(match[2], 10) : 0;
  return hrs * 60 + (hrs < 0 ? -mins : mins);
}

/** End of the ET calendar day (17:00 ET session boundary) as UTC ms. */
function etEndOfDayUtcMs(anchorIso: string): number {
  // Use 17:00 ET (futures session boundary) as "end of day".
  return etTimeToUtcMsOnSameDay(anchorIso, "17:00");
}

export interface FirmSelection {
  id: string;
  /** true = funded account, false = evaluation. Controls fundedOnly rules. */
  funded: boolean;
}

export type WindowKind = "news" | "close";

export interface BlackoutWindow {
  /** "news" = around an economic release; "close" = mandatory end-of-day flat. */
  kind: WindowKind;
  /** ISO UTC start (flat-by) time. */
  start: string;
  /** ISO UTC end (can-resume) time. For "close" windows, end = end of day. */
  end: string;
  /** The event driving this window (news title, or "Mandatory close"). */
  eventTitle: string;
  eventTime: string;
  currency: string;
  /** Which selected firms impose this window. */
  firms: { id: string; name: string; minutesBefore: number; minutesAfter: number }[];
}

export interface DayVerdict {
  /** Blackout windows for the chosen day, merged & sorted. */
  windows: BlackoutWindow[];
  /** Is trading blocked at `now`? */
  blockedNow: boolean;
  /** If blocked now, when can the user resume (ISO UTC)? */
  resumeAt: string | null;
  /** If clear now, the next blackout window start (ISO UTC), else null. */
  nextBlackoutStart: string | null;
  /** The event tied to the next/current window. */
  nextEventTitle: string | null;
  nextEventCurrency: string | null;
  /** Kind of the next/current window ("news" or "close"). */
  nextWindowKind: WindowKind | null;
  /** Firms selected that never impose hard windows (info only). */
  cautionFirms: { id: string; name: string; verdict: string }[];
  allowedFirms: { id: string; name: string }[];
}

/** A firm imposes a hard blackout for THIS selection state? */
function firmImposesBlackout(firm: FirmRule, sel: FirmSelection): boolean {
  if (firm.kind !== "blackout") return false;
  if (firm.fundedOnly && !sel.funded) return false;
  return true;
}

/**
 * Build merged blackout windows for the events on a given local day.
 * Only HIGH-impact ("elevated") events trigger hard firm windows — that is what
 * every firm's policy actually keys on (red-folder / high-impact releases).
 */
export function computeWindows(
  events: CalEvent[],
  selections: FirmSelection[],
): BlackoutWindow[] {
  // Firms that impose a hard window in their current selection state.
  const active = selections
    .map((sel) => ({ sel, firm: getFirm(sel.id) }))
    .filter((x): x is { sel: FirmSelection; firm: FirmRule } => !!x.firm)
    .filter((x) => firmImposesBlackout(x.firm, x.sel));

  if (active.length === 0 && selections.length === 0) return [];

  const windows: BlackoutWindow[] = [];

  for (const ev of events) {
    if (active.length === 0) break; // no firm imposes news windows in this state
    if (ev.risk !== "elevated") continue; // only high-impact triggers hard windows

    const evMs = new Date(ev.time).getTime();

    // For a merged window, take the widest before/after across active firms.
    let maxBefore = 0;
    let maxAfter = 0;
    const firmsHit: BlackoutWindow["firms"] = [];
    for (const { firm } of active) {
      maxBefore = Math.max(maxBefore, firm.minutesBefore);
      maxAfter = Math.max(maxAfter, firm.minutesAfter);
      firmsHit.push({
        id: firm.id,
        name: firm.name,
        minutesBefore: firm.minutesBefore,
        minutesAfter: firm.minutesAfter,
      });
    }

    const start = new Date(evMs - maxBefore * 60_000).toISOString();
    const end = new Date(evMs + maxAfter * 60_000).toISOString();

    windows.push({
      kind: "news",
      start,
      end,
      eventTitle: ev.title,
      eventTime: ev.time,
      currency: ev.currency,
      firms: firmsHit,
    });
  }

  // --- Mandatory end-of-day close windows -------------------------------
  // The earliest mandatory-close time across ALL selected firms (news rules
  // may be funded-only, but close times apply to every account) becomes a red
  // "be flat by" block running to end of day. Take the STRICTEST (earliest).
  const closeFirms = selections
    .map((sel) => getFirm(sel.id))
    .filter((f): f is FirmRule => !!f && !!f.closeTimeET);

  if (closeFirms.length > 0) {
    // Reference day = the local day of the first event, else `now`-based day is
    // resolved by the caller filtering; here we anchor on any event's date or,
    // if none, we skip (no schedule context). Anchor on first event if present.
    const anchorIso = events[0]?.time ?? new Date().toISOString();
    let earliest: { firm: FirmRule; startMs: number } | null = null;
    for (const firm of closeFirms) {
      const startMs = etTimeToUtcMsOnSameDay(anchorIso, firm.closeTimeET!);
      if (earliest === null || startMs < earliest.startMs) {
        earliest = { firm, startMs };
      }
    }
    if (earliest) {
      const endOfDayMs = etEndOfDayUtcMs(anchorIso);
      windows.push({
        kind: "close",
        start: new Date(earliest.startMs).toISOString(),
        end: new Date(endOfDayMs).toISOString(),
        eventTitle: "Mandatory daily close",
        eventTime: new Date(earliest.startMs).toISOString(),
        currency: "—",
        firms: closeFirms.map((f) => ({
          id: f.id,
          name: f.name,
          minutesBefore: 0,
          minutesAfter: 0,
        })),
      });
    }
  }

  // Merge overlapping windows (back-to-back news) into single red blocks.
  windows.sort((a, b) => a.start.localeCompare(b.start));
  const merged: BlackoutWindow[] = [];
  for (const w of windows) {
    const last = merged[merged.length - 1];
    if (last && new Date(w.start).getTime() <= new Date(last.end).getTime()) {
      // extend
      if (new Date(w.end).getTime() > new Date(last.end).getTime()) {
        last.end = w.end;
      }
      // keep the earliest/most relevant event label but note both firms
      const ids = new Set(last.firms.map((f) => f.id));
      for (const f of w.firms) if (!ids.has(f.id)) last.firms.push(f);
    } else {
      merged.push({ ...w, firms: [...w.firms] });
    }
  }

  return merged;
}

/**
 * Full day verdict relative to `now` (ISO). Filters events to the local day of
 * `now` by default is done upstream; here we just evaluate against the windows.
 */
export function computeDayVerdict(
  events: CalEvent[],
  selections: FirmSelection[],
  now: Date = new Date(),
): DayVerdict {
  const windows = computeWindows(events, selections);
  // computeWindows merges news but appends the close window; ensure global order.
  windows.sort((a, b) => a.start.localeCompare(b.start));
  const nowMs = now.getTime();

  let blockedNow = false;
  let resumeAt: string | null = null;
  let nextBlackoutStart: string | null = null;
  let nextEventTitle: string | null = null;
  let nextEventCurrency: string | null = null;
  let nextWindowKind: WindowKind | null = null;

  for (const w of windows) {
    const s = new Date(w.start).getTime();
    const e = new Date(w.end).getTime();
    if (nowMs >= s && nowMs <= e) {
      blockedNow = true;
      resumeAt = w.end;
      nextEventTitle = w.eventTitle;
      nextEventCurrency = w.currency;
      nextWindowKind = w.kind;
      break;
    }
    if (nowMs < s && nextBlackoutStart === null) {
      nextBlackoutStart = w.start;
      nextEventTitle = w.eventTitle;
      nextEventCurrency = w.currency;
      nextWindowKind = w.kind;
    }
  }

  const cautionFirms = selections
    .map((sel) => getFirm(sel.id))
    .filter((f): f is FirmRule => !!f && f.kind === "caution")
    .map((f) => ({ id: f.id, name: f.name, verdict: f.verdict }));

  const allowedFirms = selections
    .map((sel) => getFirm(sel.id))
    .filter((f): f is FirmRule => !!f && f.kind === "allowed")
    .map((f) => ({ id: f.id, name: f.name }));

  return {
    windows,
    blockedNow,
    resumeAt,
    nextBlackoutStart,
    nextEventTitle,
    nextEventCurrency,
    nextWindowKind,
    cautionFirms,
    allowedFirms,
  };
}
