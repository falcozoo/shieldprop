import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-semibold tracking-tightish text-ink">
              <span>ShieldProp</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              The information &amp; protection dashboard for funded futures traders.
              Educational tool — not investment advice.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Features", "#features"],
              ["Pricing", "#pricing"],
              ["Supported firms", "#features"],
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              ["FAQ", "#faq"],
              ["Risk disclosure", "/legal"],
              ["Contact", "mailto:hello@shieldprop.io"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Legal notice", "/legal"],
              ["Terms", "/legal"],
              ["Privacy", "/legal"],
            ]}
          />
        </div>

        <div className="mt-12 rounded-xl2 border border-line bg-card p-5 text-[12px] leading-relaxed text-muted">
          <p className="font-semibold text-ink">Risk disclosure &amp; disclaimer</p>
          <p className="mt-2">
            ShieldProp (shieldprop.io) is an information and education software tool for
            traders of futures contracts on proprietary-firm (&laquo;&nbsp;prop firm&nbsp;&raquo;)
            funded accounts. ShieldProp does not provide investment, financial, tax or legal
            advice, nor any personalized recommendation to buy, sell or hold any instrument.
            No content constitutes a trading signal.
          </p>
          <p className="mt-2">
            Trading futures and leveraged products carries a high risk of loss and is not
            suitable for everyone. You may lose all funds committed, including funded-account
            fees. Past performance does not indicate future results. ShieldProp does not
            promise, guarantee or imply any profit, income, success rate or trading outcome.
          </p>
          <p className="mt-2">
            Prop firm rules may change at any time — your firm&apos;s official terms always take
            precedence; verify them directly with your firm. Affiliate disclosure: ShieldProp
            earns a commission on some offers and promo codes at no extra cost to you; such
            links are clearly labeled. Brands mentioned (Topstep, Apex, Take Profit Trader,
            MyFundedFutures, Tradeify, Alpha Futures and others) belong to their respective
            owners and are referenced for identification only; ShieldProp is independent and
            not affiliated with or endorsed by them unless explicitly stated.
          </p>
          <p className="mt-3">&copy; 2026 ShieldProp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-ink/80 transition-colors hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
