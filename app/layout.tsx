import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shieldprop.io"),
  title: "ShieldProp — Stop blowing your prop firm account",
  description:
    "The information & protection tool for funded futures traders. Risk-window calendar, market analysis, partner offers. 3-day trial.",
  openGraph: {
    title: "ShieldProp — The anti-elimination dashboard for futures prop traders",
    description:
      "Know when NOT to trade. Risk-window calendar tailored to your prop firm, market context, and partner offers.",
    url: "https://shieldprop.io",
    siteName: "ShieldProp",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
