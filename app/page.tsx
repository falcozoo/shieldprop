import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const FIRMS = ["Topstep", "Apex", "Take Profit Trader", "MyFundedFutures", "Tradeify", "Alpha Futures"];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Pain />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

/* ---------------------------------------------------------------- HERO */
function Hero() {
  return (
    <section className="dotgrid border-b border-line">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" /> 100% futures · built for funded accounts
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tightish text-ink sm:text-6xl">
          Stop blowing your prop firm account.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          ShieldProp is the information &amp; protection dashboard built for funded futures
          traders. Know when <em className="not-italic text-ink">not</em> to trade, read the
          market with more context, and keep your account alive longer.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#pricing"
            className="rounded-lg bg-ink px-6 py-3 text-center text-base font-semibold text-paper transition-opacity hover:opacity-90"
          >
            Start your 3-day trial
          </a>
          <a
            href="#how"
            className="rounded-lg border border-line bg-card px-6 py-3 text-center text-base font-semibold text-ink transition-colors hover:bg-paper"
          >
            See how it works
          </a>
        </div>
        <p className="mt-3 text-sm text-muted">
          3-day trial · then $47/month · Cancel anytime
        </p>

        {/* Danger card preview — CLEAR card, red hairline (no black glow) */}
        <div className="mt-14 overflow-hidden rounded-xl2 border border-line bg-card shadow-card">
          <div className="border-l-2 border-danger px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-danger">
                  Restricted window approaching
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tightish text-ink">
                  Be flat in <span className="tabnum">33:12</span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  Topstep · max size during the release = prohibited strategy
                </p>
              </div>
              <div className="flex gap-2">
                <Verdict tone="danger" label="Do not trade" time="14:30" />
                <Verdict tone="caution" label="Caution" time="16:00" />
                <Verdict tone="ok" label="Allowed" time="17:30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Verdict({ tone, label, time }: { tone: "danger" | "caution" | "ok"; label: string; time: string }) {
  const map = {
    danger: "border-danger/30 text-danger",
    caution: "border-caution/30 text-caution",
    ok: "border-ok/30 text-ok",
  } as const;
  return (
    <div className={`rounded-lg border bg-paper px-3 py-2 text-center ${map[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="tabnum mt-0.5 text-sm font-medium text-ink">{time}</p>
    </div>
  );
}

/* ------------------------------------------------------------ TRUST BAR */
function TrustBar() {
  return (
    <section className="border-b border-line bg-card">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-muted">
          Works alongside the rules of
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {FIRMS.map((f) => (
            <span key={f} className="text-sm font-semibold tracking-tightish text-ink/70">
              {f}
            </span>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-muted">
          Brands shown for reference only. ShieldProp is not affiliated with or endorsed by these
          companies unless explicitly stated.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- PAIN */
function Pain() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tightish text-ink sm:text-4xl">
            Most funded accounts don&apos;t survive. That&apos;s not an accident.
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted">
            <p>
              According to public industry data, <strong className="text-ink">85–90% of traders
              fail</strong> their challenge or lose their funded account. The cause is almost never
              a lack of good trades — it&apos;s one trade too many, at the wrong moment: inside a
              volatile news window, outside the firm&apos;s rules, or mid-impulse.
            </p>
            <p>
              Prop firms collect a fee on every new attempt. The system is built for repetition,
              not for your survival.
            </p>
            <p>
              ShieldProp flips that logic: it gives you the{" "}
              <strong className="text-ink">information</strong> and the{" "}
              <strong className="text-ink">guardrails</strong> to avoid the trade that breaks
              everything — instead of chasing the trade that &laquo;&nbsp;fixes everything&nbsp;&raquo;.
            </p>
          </div>
        </div>
        <div className="rounded-xl2 border border-line bg-card p-8 text-center shadow-card">
          <p className="tabnum text-6xl font-semibold tracking-tightish text-danger">85–90%</p>
          <p className="mt-3 text-sm text-muted">
            of funded accounts are lost. Source: public prop-trading industry data.
          </p>
          <p className="mt-4 text-[11px] leading-relaxed text-muted">
            Industry statistic shown for information only. It does not reflect or predict your
            personal outcome.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- FEATURES */
function Features() {
  const items = [
    {
      tag: "Calendar",
      title: "Know when to close the chart",
      sub: "Risk-window calendar, tailored to your prop firm",
      body: "Every firm has its own restrictions around economic releases. ShieldProp syncs the economic calendar with your firm's rules and clearly shows the windows where trading exposes you to elimination or a rule breach.",
      bullets: [
        "Restricted news windows, matched to your firm",
        "Alerts before high-impact releases",
        "Fewer accidental rule breaches",
      ],
    },
    {
      tag: "Analysis",
      title: "Read the market with more context",
      sub: "Fundamental analysis + liquidity zones and trap mapping",
      body: "ShieldProp gathers the day's fundamental context and highlights, for educational purposes, liquidity zones and setups where many traders get trapped. Not what to buy — where risk concentrates.",
      bullets: [
        "Daily fundamental briefing",
        "Liquidity zones and traps illustrated on chart",
        "Educational context, not signals",
      ],
      note: "Strictly informational and educational content. Not investment advice or a recommendation to trade.",
    },
    {
      tag: "Offers",
      title: "Pay less for your challenges",
      sub: "Partner promo codes and offers, all in one place",
      body: "Challenges and resets add up fast. ShieldProp centralizes current promo codes and offers from partner prop firms so you never pay full price — transparent and clearly labeled.",
      bullets: [
        "Up-to-date promo codes from partner firms",
        "Clear side-by-side of offers",
        "Affiliate links disclosed transparently",
      ],
      note: "ShieldProp earns an affiliate commission on some offers, at no extra cost to you.",
    },
  ];

  return (
    <section id="features" className="border-b border-line bg-card">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tightish text-ink sm:text-4xl">
          Three tools. One goal: keep your account alive.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="flex flex-col rounded-xl2 border border-line bg-paper p-6">
              <span className="w-fit rounded-md border border-line bg-card px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {it.tag}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tightish text-ink">{it.title}</h3>
              <p className="mt-1 text-sm font-medium text-muted">{it.sub}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{it.body}</p>
              <ul className="mt-4 space-y-2 text-sm text-ink/80">
                {it.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
                    {b}
                  </li>
                ))}
              </ul>
              {it.note && <p className="mt-4 text-[11px] leading-relaxed text-muted">{it.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- HOW IT WORKS */
function HowItWorks() {
  const steps = [
    ["Pick your firm", "Choose Topstep, Apex, Take Profit Trader, MyFundedFutures, Tradeify or Alpha Futures."],
    ["Get your calendar", "ShieldProp shows your risk windows and the day's market context."],
    ["Trade with more perspective", "You decide — but this time, fully informed."],
  ];
  return (
    <section id="how" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-semibold tracking-tightish text-ink sm:text-4xl">Set up in three minutes.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <div key={t} className="rounded-xl2 border border-line bg-card p-6 shadow-card">
              <p className="tabnum text-sm font-semibold text-muted">0{i + 1}</p>
              <h3 className="mt-3 text-lg font-semibold tracking-tightish text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- PRICING */
function Pricing() {
  const features = [
    "Full risk-window calendar, tailored to your firm",
    "Unlimited news-window alerts",
    "Complete daily fundamental briefing",
    "Liquidity zones & traps on chart",
    "Access to all supported firms",
    "Partner promo codes & offers",
  ];

  return (
    <section id="pricing" className="border-b border-line bg-card">
      <div className="mx-auto max-w-5xl px-5 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tightish text-ink sm:text-4xl">
          One plan. Everything included.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted">
          No tiers, no upsells. Pick monthly or save big with yearly.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 md:items-stretch">
          {/* MONTHLY */}
          <div className="flex flex-col rounded-xl2 border border-line bg-paper p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Monthly</p>
            <p className="mt-3 tabnum text-5xl font-semibold tracking-tightish text-ink">
              $47<span className="text-base font-normal text-muted"> / month</span>
            </p>
            <p className="mt-2 text-sm text-muted">Start with a 3-day trial. Cancel anytime.</p>

            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink/80">
              {features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="#"
              className="mt-8 rounded-lg border border-line bg-card px-5 py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-paper"
            >
              Start 3-day trial
            </a>
            <p className="mt-2 text-center text-[11px] text-muted">
              Then $47/month · cancel anytime
            </p>
          </div>

          {/* YEARLY — featured, promo */}
          <div className="relative flex flex-col rounded-xl2 border-2 border-ink bg-paper p-8 shadow-card">
            <span className="absolute -top-3 left-8 rounded-full bg-danger px-3 py-1 text-[11px] font-semibold text-paper">
              Save 56% · limited offer
            </span>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Yearly</p>

            <div className="mt-3 flex items-end gap-3">
              <p className="tabnum text-5xl font-semibold tracking-tightish text-ink">
                $249<span className="text-base font-normal text-muted"> / year</span>
              </p>
            </div>
            <p className="mt-2 text-sm text-muted">
              <span className="tabnum text-ink/50 line-through">$564</span>{" "}
              <span className="font-medium text-ink">— that&apos;s ~$20.75/month</span>, billed yearly.
            </p>

            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink/80">
              {features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="#"
              className="mt-8 rounded-lg bg-ink px-5 py-3 text-center text-sm font-semibold text-paper transition-opacity hover:opacity-90"
            >
              Get 1 year for $249
            </a>
            <p className="mt-2 text-center text-[11px] text-muted">
              One payment · save $315 vs monthly
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted">
          No plan guarantees a trading outcome. ShieldProp provides information and tools, not profits.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */
function Faq() {
  const qas = [
    ["Does ShieldProp guarantee I'll pass my challenge or make money?", "No — and be wary of any tool that claims it does. ShieldProp promises no profits, no success rate and no income. We give you information and guardrails to make more informed decisions. The outcome depends entirely on you and the markets."],
    ["Is this investment advice or trade signals?", "No. ShieldProp is an information and education tool. We do not provide personalized advice, buy/sell recommendations, or signals. We never tell you what to trade — we help you understand context and risk."],
    ["Is ShieldProp affiliated with the prop firms you mention?", "We have affiliate partnerships with some firms, which lets us offer promo codes. Those links are always clearly labeled. Otherwise, brands are mentioned for reference only: ShieldProp is independent, neither endorsed nor operated by these companies."],
    ["Does the restricted-windows calendar replace my firm's rules?", "No. It's an informational aid. Your prop firm's official rules always take precedence. Always check the current terms directly with your firm — that's your responsibility, not ours."],
    ["Is futures trading risky?", "Yes. Futures trading carries a high risk of loss and isn't suitable for everyone. You can lose more than your initial stake. ShieldProp does not reduce that market risk — it only helps you stay better informed."],
    ["How do the trial and cancellation work?", "The monthly plan includes a 3-day trial, then bills $47/month — cancel anytime in one click. The yearly plan is billed once at $249 (no trial) and saves you 56% versus paying monthly."],
  ];
  return (
    <section id="faq" className="border-b border-line">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-3xl font-semibold tracking-tightish text-ink sm:text-4xl">Frequently asked questions</h2>
        <div className="mt-10 divide-y divide-line">
          {qas.map(([q, a]) => (
            <div key={q} className="py-5">
              <p className="font-semibold tracking-tightish text-ink">{q}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ FINAL CTA */
function FinalCta() {
  return (
    <section className="dotgrid">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tightish text-ink sm:text-4xl">
          The next account-breaking trade hasn&apos;t happened yet. Get ahead of it.
        </h2>
        <p className="mt-4 text-lg text-muted">
          Join the futures traders taking back control of their discipline with ShieldProp.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="#pricing" className="rounded-lg bg-ink px-6 py-3 text-base font-semibold text-paper transition-opacity hover:opacity-90">
            Start your 3-day trial
          </a>
          <a href="#pricing" className="rounded-lg border border-line bg-card px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-paper">
            Get 1 year for $249
          </a>
        </div>
        <p className="mt-3 text-sm text-muted">3-day trial on monthly · yearly saves 56%</p>
      </div>
    </section>
  );
}
