import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Legal & Risk Disclosure — ShieldProp",
  robots: { index: false, follow: true },
};

export default function LegalPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-semibold tracking-tightish text-ink">
          Legal notice &amp; risk disclosure
        </h1>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted">
          <p>
            ShieldProp (shieldprop.io) is an <strong className="text-ink">information and
            education</strong> software tool for traders of futures contracts operating on
            proprietary-firm (&laquo;&nbsp;prop firm&nbsp;&raquo;) funded accounts. ShieldProp
            does not provide investment advice, financial, tax or legal advice, or any
            personalized recommendation to buy, sell or hold any financial instrument. No content
            published constitutes a trading signal.
          </p>
          <p>
            Trading futures and leveraged products carries a{" "}
            <strong className="text-ink">high risk of loss</strong> and is not suitable for all
            investors. You may lose all funds committed, including any fees associated with a
            funded account. Past performance is not indicative of future results.
          </p>
          <p>
            ShieldProp <strong className="text-ink">does not promise, guarantee or imply any
            profit, income, success rate or trading outcome</strong>. Any industry statistic
            (including the failure rates cited) is provided for informational purposes only and
            does not predict your personal outcome. Your trading decisions are your sole
            responsibility.
          </p>
          <p>
            Prop firm rules, restrictions and terms may change at any time. The risk-window
            calendar and all other ShieldProp content are provided for reference only:{" "}
            <strong className="text-ink">your prop firm&apos;s official terms always take
            precedence</strong> and it is your responsibility to verify them directly with your firm.
          </p>
          <p>
            <strong className="text-ink">Affiliate disclosure:</strong> ShieldProp maintains
            affiliate partnerships with certain prop firms and earns a commission on some offers
            and promo codes, at no extra cost to you. Such links are clearly labeled. ShieldProp
            is an independent service; the brands mentioned (Topstep, Apex, Take Profit Trader,
            MyFundedFutures, Tradeify, Alpha Futures and others) belong to their respective owners
            and are referenced for identification only. ShieldProp is not affiliated with,
            endorsed by, sponsored by, or operated by these companies unless explicitly stated,
            and is not responsible for the services they provide.
          </p>
          <p>
            By using ShieldProp, you acknowledge that you have read and understood this
            disclaimer. Consult an independent licensed professional before making any financial
            decision.
          </p>
          <p className="text-ink">&copy; 2026 ShieldProp. All rights reserved.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
