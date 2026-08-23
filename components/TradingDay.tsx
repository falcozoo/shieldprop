"use client";

/**
 * ShieldProp — Trading-day dashboard (the real product).
 *
 * Flow:
 *  1. User picks their prop firm(s) + funded/eval toggle per firm.
 *  2. We fetch today's high-impact events (Forex Factory feed via /api/calendar).
 *  3. The engine merges every selected firm's blackout windows into one verdict.
 *  4. We show: a live "next blackout in XX:XX" countdown + a full-day timeline of
 *     when the user CAN and CANNOT trade, with the driving news labelled.
 *
 * Compliance: informational only; the user must confirm their firm's own rules.
 */

import { useEffect, useMemo, useState } from "react";
import { FIRMS, getFirm } from "@/lib/firms";
import {
  computeDayVerdict,
  type FirmSelection,
} from "@/lib/tradingWindows";
import type { CalEvent } from "@/lib/calendar";

const LS_KEY = "shieldprop.selections.v1";

function useLocalTz() {
  const [tz, setTz] = useState("UTC");
  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      setTz("UTC");
    }
  }, []);
  return tz;
}

function fmtTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Keep only events whose local calendar day matches `refDay`. */
function sameLocalDay(iso: string, refDay: Date, tz: string): boolean {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
  return fmt(new Date(iso)) === fmt(refDay);
}

export default function TradingDay() {
  const tz = useLocalTz();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [selections, setSelections] = useState<FirmSelection[]>([]);

  // Load persisted selections.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSelections(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist selections.
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(selections));
    } catch {
      /* ignore */
    }
  }, [selections]);

  // Live clock (1s) — drives the countdown + status flips.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch events once.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/calendar?minImpact=Medium");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) setEvents(data.events ?? []);
      } catch (e) {
        if (alive) setError("Calendar temporarily unavailable. Try again shortly.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const isSelected = (id: string) => selections.some((s) => s.id === id);
  const selectionOf = (id: string) => selections.find((s) => s.id === id);

  function toggleFirm(id: string) {
    setSelections((prev) =>
      prev.some((s) => s.id === id)
        ? prev.filter((s) => s.id !== id)
        : [...prev, { id, funded: true }],
    );
  }

  function setFunded(id: string, funded: boolean) {
    setSelections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, funded } : s)),
    );
  }

  // Today's events (local day) only.
  const todaysEvents = useMemo(
    () => events.filter((e) => sameLocalDay(e.time, now, tz)),
    [events, now, tz],
  );

  const verdict = useMemo(
    () => computeDayVerdict(todaysEvents, selections, now),
    [todaysEvents, selections, now],
  );

  const hasSelection = selections.length > 0;

  // ---- Render -------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tightish text-ink">
          Your trading day
        </h1>
        <p className="mt-1 text-sm text-muted">
          When your prop firm rules say you can — and can&apos;t — trade today.
        </p>
        <p className="mt-2 text-[11px] text-muted">
          Times shown in your local timezone ({tz}). Informational only — always
          confirm your prop firm&apos;s own current rules.
        </p>
      </header>

      {/* Firm picker */}
      <section className="mb-6 rounded-xl2 border border-line bg-card p-4 shadow-card">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-muted">
          Select your prop firm(s)
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FIRMS.map((f) => {
            const sel = selectionOf(f.id);
            const on = isSelected(f.id);
            return (
              <div
                key={f.id}
                className={`rounded-lg border p-3 transition-colors ${
                  on ? "border-ink bg-paper" : "border-line bg-card"
                }`}
              >
                <button
                  onClick={() => toggleFirm(f.id)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="font-medium text-ink">{f.name}</span>
                  <span
                    className={`ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px] ${
                      on
                        ? "border-ink bg-ink text-white"
                        : "border-line text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
                <p className="mt-1 text-[12px] leading-snug text-muted">
                  {f.summary}
                </p>
                {on && f.kind === "blackout" && f.fundedOnly && (
                  <div className="mt-2 flex items-center gap-2 text-[12px]">
                    <span className="text-muted">Account:</span>
                    <div className="inline-flex overflow-hidden rounded border border-line">
                      <button
                        onClick={() => setFunded(f.id, false)}
                        className={`px-2 py-0.5 ${
                          sel && !sel.funded
                            ? "bg-ink text-white"
                            : "bg-card text-muted"
                        }`}
                      >
                        Evaluation
                      </button>
                      <button
                        onClick={() => setFunded(f.id, true)}
                        className={`px-2 py-0.5 ${
                          sel && sel.funded
                            ? "bg-ink text-white"
                            : "bg-card text-muted"
                        }`}
                      >
                        Funded
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {loading && (
        <div className="rounded-xl2 border border-line bg-card p-6 text-center text-muted shadow-card">
          Loading today&apos;s events…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl2 border border-line bg-card p-6 text-center text-danger shadow-card">
          {error}
        </div>
      )}

      {!loading && !error && !hasSelection && (
        <div className="rounded-xl2 border border-dashed border-line bg-card p-8 text-center text-muted shadow-card">
          Pick at least one prop firm above to see your trading windows for today.
        </div>
      )}

      {!loading && !error && hasSelection && (
        <>
          {/* Status banner + countdown */}
          <StatusBanner verdict={verdict} now={now} tz={tz} />

          {/* Day timeline */}
          <DayTimeline
            windows={verdict.windows}
            events={todaysEvents}
            now={now}
            tz={tz}
          />

          {/* Info firms (no hard window) */}
          {(verdict.cautionFirms.length > 0 ||
            verdict.allowedFirms.length > 0) && (
            <div className="mt-4 rounded-xl2 border border-line bg-card p-4 text-[12px] text-muted shadow-card">
              {verdict.allowedFirms.length > 0 && (
                <p>
                  <span className="text-ok">●</span> No news window:{" "}
                  {verdict.allowedFirms.map((f) => f.name).join(", ")}.
                </p>
              )}
              {verdict.cautionFirms.length > 0 && (
                <p className="mt-1">
                  <span className="text-caution">●</span> Reduce size around news:{" "}
                  {verdict.cautionFirms.map((f) => f.name).join(", ")}.
                </p>
              )}
            </div>
          )}

          {/* Full rules cards for each selected firm */}
          <RulesCards selections={selections} />
        </>
      )}
    </div>
  );
}

function StatusBanner({
  verdict,
  now,
  tz,
}: {
  verdict: ReturnType<typeof computeDayVerdict>;
  now: Date;
  tz: string;
}) {
  const { blockedNow, resumeAt, nextBlackoutStart, nextEventTitle, nextEventCurrency, nextWindowKind } =
    verdict;

  const isClose = nextWindowKind === "close";

  if (blockedNow && resumeAt) {
    const ms = new Date(resumeAt).getTime() - now.getTime();
    return (
      <div className="rounded-xl2 border border-l-4 border-line border-l-danger bg-card p-5 shadow-card">
        <div className="font-mono text-[11px] uppercase tracking-wide text-danger">
          {isClose ? "Do not trade — mandatory close" : "Do not trade — news window"}
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tightish text-ink">
          Stay flat for{" "}
          <span className="tabular-nums text-danger">{fmtCountdown(ms)}</span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {isClose
            ? "Mandatory daily close is in effect."
            : `${nextEventCurrency} · ${nextEventTitle}.`}{" "}
          {isClose ? "" : `You can resume at ${fmtTime(resumeAt, tz)}.`}
        </p>
      </div>
    );
  }

  if (nextBlackoutStart) {
    const ms = new Date(nextBlackoutStart).getTime() - now.getTime();
    return (
      <div className="rounded-xl2 border border-l-4 border-line border-l-caution bg-card p-5 shadow-card">
        <div className="font-mono text-[11px] uppercase tracking-wide text-caution">
          Clear to trade
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tightish text-ink">
          {isClose ? "Mandatory close in " : "Next blackout in "}
          <span className="tabular-nums">{fmtCountdown(ms)}</span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {isClose ? (
            <>Be flat by {fmtTime(nextBlackoutStart, tz)} (mandatory daily close).</>
          ) : (
            <>
              Be flat by {fmtTime(nextBlackoutStart, tz)} for {nextEventCurrency} ·{" "}
              {nextEventTitle}.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl2 border border-l-4 border-line border-l-ok bg-card p-5 shadow-card">
      <div className="font-mono text-[11px] uppercase tracking-wide text-ok">
        Clear to trade
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tightish text-ink">
        No trading blackouts for the rest of today
      </div>
      <p className="mt-1 text-sm text-muted">
        Your selected firms impose no news restrictions on your remaining
        high-impact events today.
      </p>
    </div>
  );
}

function DayTimeline({
  windows,
  events,
  now,
  tz,
}: {
  windows: ReturnType<typeof computeDayVerdict>["windows"];
  events: CalEvent[];
  now: Date;
  tz: string;
}) {
  // Build an ordered list of "blocks" for the day: red blackout windows
  // interleaved with the high-impact events that fall outside them.
  const elevated = events.filter((e) => e.risk === "elevated");

  return (
    <div className="mt-5">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">
        Today&apos;s schedule
      </div>

      {windows.length === 0 && elevated.length === 0 && (
        <div className="rounded-xl2 border border-line bg-card p-5 text-sm text-muted shadow-card">
          No high-impact events scheduled today.
        </div>
      )}

      <ul className="space-y-2">
        {windows.map((w, i) => {
          const s = new Date(w.start).getTime();
          const e = new Date(w.end).getTime();
          const active = now.getTime() >= s && now.getTime() <= e;
          const past = now.getTime() > e;
          return (
            <li
              key={`w-${i}`}
              className={`rounded-xl2 border border-l-4 border-line border-l-danger bg-danger/10 p-4 shadow-card ${
                past ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wide text-danger">
                  {w.kind === "close" ? "Mandatory flat" : "Do not trade"}
                  {active ? " · now" : ""}
                </span>
                <span className="tabular-nums text-sm font-medium text-ink">
                  {w.kind === "close"
                    ? `from ${fmtTime(w.start, tz)}`
                    : `${fmtTime(w.start, tz)} – ${fmtTime(w.end, tz)}`}
                </span>
              </div>
              <div className="mt-1 text-sm text-ink">
                {w.kind === "close"
                  ? "Close all positions before end of day"
                  : `${w.currency} · ${w.eventTitle}`}
              </div>
              <div className="mt-1 text-[12px] text-muted">
                {w.kind === "close" ? (
                  <>Required by: {w.firms.map((f) => f.name).join(" · ")}</>
                ) : (
                  <>
                    Blocked by:{" "}
                    {w.firms
                      .map(
                        (f) =>
                          `${f.name} (${f.minutesBefore}m before / ${f.minutesAfter}m after)`,
                      )
                      .join(" · ")}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* High-impact events NOT inside any hard window (informational) */}
      {elevated.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">
            High-impact events today
          </div>
          <ul className="space-y-1">
            {elevated.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-line bg-card px-3 py-2 text-sm shadow-card"
              >
                <span className="text-ink">
                  {e.currency} · {e.title}
                </span>
                <span className="tabular-nums text-muted">
                  {fmtTime(e.time, tz)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RulesCards({
  selections,
}: {
  selections: FirmSelection[];
}) {
  if (selections.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">
        Your firm rules
      </div>
      <div className="space-y-3">
        {selections.map((sel) => {
          const firm = getFirm(sel.id);
          if (!firm) return null;
          return (
            <div
              key={sel.id}
              className="rounded-xl2 border border-line bg-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{firm.name}</span>
                {firm.kind === "blackout" && firm.fundedOnly && (
                  <span className="rounded border border-line px-2 py-0.5 text-[11px] text-muted">
                    {sel.funded ? "Funded" : "Evaluation"}
                  </span>
                )}
              </div>

              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {firm.rules.map((r, i) => (
                  <div key={i} className="border-b border-line pb-2">
                    <dt className="text-[11px] uppercase tracking-wide text-muted">
                      {r.label}
                    </dt>
                    <dd className="text-sm text-ink">
                      {r.value}
                      {r.note && (
                        <span className="block text-[11px] text-muted">
                          {r.note}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
                {firm.closeTimeET && (
                  <div className="border-b border-line pb-2">
                    <dt className="text-[11px] uppercase tracking-wide text-muted">
                      Daily close
                    </dt>
                    <dd className="text-sm text-ink">
                      {firm.closeTimeET} ET
                      {firm.closeNote && (
                        <span className="block text-[11px] text-muted">
                          {firm.closeNote}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>

              <a
                href={firm.source}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-[12px] text-muted underline hover:text-ink"
              >
                Official rules ↗
              </a>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Rule values shown for common account sizes and can vary by size/plan.
        Informational only — always confirm your firm&apos;s current rules.
      </p>
    </div>
  );
}
