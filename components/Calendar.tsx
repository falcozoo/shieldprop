"use client";

import { useEffect, useMemo, useState } from "react";

type RiskLevel = "elevated" | "caution" | "clear";
type Impact = "High" | "Medium" | "Low" | "Holiday";

interface CalEvent {
  id: string;
  title: string;
  currency: string;
  time: string; // ISO UTC
  impact: Impact;
  risk: RiskLevel;
  forecast: string;
  previous: string;
}

const RISK_META: Record<
  RiskLevel,
  { label: string; dot: string; chipBg: string; chipText: string; border: string }
> = {
  elevated: {
    label: "Elevated risk",
    dot: "bg-danger",
    chipBg: "bg-danger/10",
    chipText: "text-danger",
    border: "border-l-danger",
  },
  caution: {
    label: "Caution",
    dot: "bg-caution",
    chipBg: "bg-caution/10",
    chipText: "text-caution",
    border: "border-l-caution",
  },
  clear: {
    label: "Clear",
    dot: "bg-ok",
    chipBg: "bg-ok/10",
    chipText: "text-ok",
    border: "border-l-ok",
  },
};

function dayKey(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendar() {
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [error, setError] = useState(false);
  const [onlyElevated, setOnlyElevated] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/calendar")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (alive) setEvents(d.events as CalEvent[]);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const filtered = useMemo(() => {
    if (!events) return [];
    return onlyElevated ? events.filter((e) => e.risk === "elevated") : events;
  }, [events, onlyElevated]);

  // Group by local day.
  const groups = useMemo(() => {
    const map = new Map<string, { date: Date; items: CalEvent[] }>();
    for (const e of filtered) {
      const d = new Date(e.time);
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, { date: d, items: [] });
      map.get(key)!.items.push(e);
    }
    return Array.from(map.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [filtered]);

  // Today's summary (the "aha" glance).
  const today = new Date();
  const todayElevated =
    events?.filter((e) => e.risk === "elevated" && isSameDay(new Date(e.time), today)) ?? [];
  const nextElevated = events
    ?.filter((e) => e.risk === "elevated" && new Date(e.time) > today)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];

  if (error) {
    return (
      <div className="rounded-xl2 border border-line bg-card p-8 text-center">
        <p className="font-semibold text-ink">Calendar temporarily unavailable</p>
        <p className="mt-1 text-sm text-muted">
          The market data feed didn&apos;t respond. Refresh in a moment.
        </p>
      </div>
    );
  }

  if (!events) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl2 border border-line bg-card"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* TODAY SUMMARY */}
      <div className="rounded-xl2 border border-line bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              Today&apos;s risk window
            </p>
            {todayElevated.length > 0 ? (
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-ink">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-danger" />
                {todayElevated.length} elevated-risk event
                {todayElevated.length > 1 ? "s" : ""} today — stay disciplined
              </p>
            ) : (
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-ink">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-ok" />
                No elevated-risk events today
              </p>
            )}
            {nextElevated && (
              <p className="mt-1 text-sm text-muted">
                Next elevated window:{" "}
                <span className="font-medium text-ink">
                  {nextElevated.currency} · {nextElevated.title}
                </span>{" "}
                —{" "}
                {new Date(nextElevated.time).toLocaleString(undefined, {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <button
            onClick={() => setOnlyElevated((v) => !v)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              onlyElevated
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink hover:bg-card"
            }`}
          >
            {onlyElevated ? "Showing elevated only" : "Show elevated only"}
          </button>
        </div>
        <p className="mt-4 text-xs text-muted">
          Times shown in your local timezone ({tz}). Informational only — always
          confirm your prop firm&apos;s own rules.
        </p>
      </div>

      {/* DAY GROUPS */}
      {groups.length === 0 && (
        <p className="text-center text-sm text-muted">
          No events match this filter.
        </p>
      )}
      {groups.map((g) => (
        <div key={g.date.toDateString()}>
          <h3 className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted">
            {dayKey(g.date)}
            {isSameDay(g.date, today) && (
              <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-paper">
                TODAY
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {g.items.map((e) => {
              const meta = RISK_META[e.risk];
              const t = new Date(e.time).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-4 rounded-lg border border-line border-l-4 bg-card px-4 py-3 ${meta.border}`}
                >
                  <div className="w-16 shrink-0 tabnum text-sm font-medium text-ink">
                    {t}
                  </div>
                  <div className="w-12 shrink-0">
                    <span className="rounded bg-paper px-2 py-0.5 text-xs font-semibold text-ink">
                      {e.currency}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {e.title}
                    </p>
                    {(e.forecast || e.previous) && (
                      <p className="mt-0.5 text-xs text-muted">
                        {e.forecast && <>Forecast {e.forecast} · </>}
                        {e.previous && <>Prev {e.previous}</>}
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.chipBg} ${meta.chipText}`}
                  >
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
