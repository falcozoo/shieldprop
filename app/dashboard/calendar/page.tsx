import type { Metadata } from "next";
import Link from "next/link";
import Calendar from "@/components/Calendar";

export const metadata: Metadata = {
  title: "Risk Calendar — ShieldProp",
  robots: { index: false, follow: false },
};

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded bg-ink" />
            <span className="font-semibold tracking-tightish text-ink">
              ShieldProp
            </span>
          </div>
          <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
            ← Your trading day
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tightish text-ink sm:text-3xl">
            Risk-window calendar
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            High-impact macro events mapped to risk windows. Know when the market
            is most likely to move against undisciplined trades — and stay
            informed, not exposed.
          </p>
        </div>

        <Calendar />
      </div>
    </main>
  );
}
