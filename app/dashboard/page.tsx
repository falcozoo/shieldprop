import type { Metadata } from "next";
import Link from "next/link";
import TradingDay from "@/components/TradingDay";

export const metadata: Metadata = {
  title: "Your Trading Day — ShieldProp",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Top bar */}
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded bg-ink" />
            <span className="font-semibold tracking-tightish text-ink">
              ShieldProp
            </span>
          </div>
          <Link
            href="/dashboard/calendar"
            className="text-sm text-muted hover:text-ink"
          >
            Full calendar →
          </Link>
        </div>
      </header>

      <TradingDay />
    </main>
  );
}
