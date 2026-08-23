/**
 * ShieldProp — Prop firm rules (curated, owned dataset).
 *
 * WHY HAND-CURATED (not scraped live): firm rules live in prose on each firm's
 * FAQ pages and change when the firm decides. A stale displayed rule = a trader
 * gets eliminated = our liability. Source of truth is THIS file, which we own.
 * A separate IA cron watches each firm's rules page and alerts the operator on
 * change → operator confirms in ~30s → this file is updated → propagates.
 *
 * Sources verified 2026-08-21 / 2026-08-23 (see SKILL falco-saas-propguard).
 *
 * Two rule layers:
 *  - NEWS blackout (minutesBefore/After, fundedOnly) → drives the red timeline.
 *  - MANDATORY CLOSE time (closeTimeET) → also drives a red timeline block.
 *  - Structural rules (drawdown, daily loss, consistency, min days, contracts,
 *    profit split) → shown in the firm's rules card. Values vary by account
 *    size; we show the common sizes and flag "varies by size".
 */

export type FirmRuleKind = "blackout" | "caution" | "allowed";

/** One structural rule shown in the rules card. */
export interface RuleFact {
  label: string;
  value: string;
  /** Optional short note (e.g. "funded only", "varies by size"). */
  note?: string;
}

export interface FirmRule {
  id: string;
  name: string;
  /** Public rules page (for the IA watcher + user reference link). */
  source: string;

  // --- News window (red timeline) ---
  kind: FirmRuleKind;
  minutesBefore: number;
  minutesAfter: number;
  /** News blackout applies only on funded accounts (not evaluation). */
  fundedOnly: boolean;

  // --- Mandatory close time (red timeline) ---
  /**
   * Daily mandatory-flat time in US Eastern, "HH:MM" 24h, or null if none.
   * We turn this into a red "be flat by" block at the end of the day.
   */
  closeTimeET: string | null;
  closeNote?: string;

  // --- Card content ---
  summary: string;
  verdict: string;
  /** Structural rules for the rules card. */
  rules: RuleFact[];
}

export const FIRMS: FirmRule[] = [
  {
    id: "topstep",
    name: "Topstep",
    source: "https://help.topstep.com/en/articles/8284197-trading-combine-parameters",
    kind: "caution",
    minutesBefore: 0,
    minutesAfter: 0,
    fundedOnly: false,
    closeTimeET: "15:10",
    closeNote: "Positions should be closed before the daily maintenance window (4:10pm ET / 3:10pm CT).",
    summary:
      "No mandatory news flat window. Trading max size during a major release is a prohibited strategy — reduce size around news.",
    verdict: "Caution around news (no hard flatten)",
    rules: [
      { label: "Drawdown", value: "End-of-day trailing Max Loss Limit", note: "locks at start balance once in profit; resets to $0 after first payout" },
      { label: "Max Loss Limit", value: "$2,000 / $3,000 / $4,500", note: "50K / 100K / 150K" },
      { label: "Daily loss limit", value: "$1,000 / $2,000 / $3,000", note: "optional in Combine, mandatory on Live" },
      { label: "Consistency", value: "40% on Consistency payout path", note: "largest day ≤ 40% of net profit" },
      { label: "Min. trading days", value: "5 winning days ($150+) or 3-day 40% path" },
      { label: "Max contracts", value: "5 / 10 / 15 minis", note: "50K / 100K / 150K" },
      { label: "Profit split", value: "90 / 10" },
    ],
  },
  {
    id: "apex",
    name: "Apex Trader Funding",
    source: "https://apextraderfunding.com/help-center/getting-started/prohibited-activities/",
    kind: "allowed",
    minutesBefore: 0,
    minutesAfter: 0,
    fundedOnly: false,
    closeTimeET: "16:59",
    closeNote: "Flat by 4:59pm ET (close before 5:00pm ET session boundary).",
    summary:
      "News trading allowed with a normal strategy. Only bidirectional 'gambling' on the outcome is prohibited.",
    verdict: "News trading allowed",
    rules: [
      { label: "Drawdown (eval)", value: "Intraday trailing (new EOD option available)" },
      { label: "30% Negative P&L rule", value: "Open loss ≤ 30% of start-of-day profit", note: "funded PA accounts" },
      { label: "Consistency", value: "30% — no day > 30% of total profit", note: "early funded period, then relaxes" },
      { label: "Profit target (eval)", value: "$1,500 / $3,000 / $6,000 / $9,000", note: "by size; no consistency in eval" },
      { label: "Half-size rule", value: "Trade half contracts until trailing threshold cleared" },
      { label: "Profit split", value: "100% first $25k, then 90 / 10" },
    ],
  },
  {
    id: "takeprofittrader",
    name: "Take Profit Trader",
    source: "https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15171769361053-PRO-Account-Rules",
    kind: "blackout",
    minutesBefore: 1,
    minutesAfter: 1,
    fundedOnly: true,
    closeTimeET: "16:10",
    closeNote: "All positions must be closed by 4:10pm ET.",
    summary:
      "On funded PRO/PRO+ accounts: be flat with no open orders 1 min before, during, and 1 min after high-impact events. Evaluation is unrestricted.",
    verdict: "Funded: flat 1 min before/after news",
    rules: [
      { label: "Drawdown (eval)", value: "End-of-day trailing" },
      { label: "Drawdown (funded PRO)", value: "Intraday trailing", note: "⚠️ changes from EOD in eval to intraday when funded" },
      { label: "Max loss", value: "$1,500 / $2,000 / $3,000 / $4,500", note: "25K / 50K / 100K / 150K" },
      { label: "Daily loss limit", value: "None", note: "removed across all sizes (Jan 2025)" },
      { label: "Consistency (eval)", value: "50% — no day ≥ 50% of net profit", note: "none on funded PRO" },
      { label: "Min. trading days", value: "5 (evaluation)" },
      { label: "Profit split", value: "80 / 20 (PRO), 90 / 10 (PRO+ Live)" },
    ],
  },
  {
    id: "tradeify",
    name: "Tradeify",
    source: "https://help.tradeify.co/en/articles/10495874-rules-news-trading",
    kind: "allowed",
    minutesBefore: 0,
    minutesAfter: 0,
    fundedOnly: false,
    closeTimeET: "16:59",
    closeNote: "Intraday firm — flat before the 5:00pm ET session close.",
    summary:
      "News trading allowed with no time window on all accounts. (An unrelated micro-scalping payout rule still applies.)",
    verdict: "News trading allowed",
    rules: [
      { label: "Drawdown", value: "End-of-day only (Select/Flex)", note: "locks improvements only on profitable close" },
      { label: "Consistency (Select eval)", value: "40% — no day > 40% of profit", note: "none on funded Select payouts" },
      { label: "Min. trading days", value: "3 (Select, due to consistency)" },
      { label: "Micro-scalping rule", value: ">50% of trades AND >50% profit under 10s can block payout", note: "funded" },
      { label: "No swing trading", value: "Positions closed daily" },
    ],
  },
  {
    id: "alphafutures",
    name: "Alpha Futures",
    source: "https://help.alpha-futures.com/en/articles/9492063-news-trading-policy",
    kind: "blackout",
    minutesBefore: 2,
    minutesAfter: 2,
    fundedOnly: true,
    closeTimeET: "16:20",
    closeNote: "All trades must be closed before 4:20pm ET each day (session 6:00pm→5:00pm ET).",
    summary:
      "On funded Direct/Standard/Zero accounts: no order executed 2 min before or 2 min after a high-impact event. Evaluation and Advanced are unrestricted.",
    verdict: "Funded: flat 2 min before/after news",
    rules: [
      { label: "Drawdown", value: "End-of-day trailing MLL (all plans)", note: "does not trail intraday" },
      { label: "Max Loss Limit", value: "≈4% trailing (Standard/Zero)", note: "from daily closing balance" },
      { label: "Daily Loss Guard", value: "$500 / $1,000 / $2,000", note: "Zero plan only, by size" },
      { label: "Consistency", value: "20% — no winning-day requirement" },
      { label: "Account limit", value: "One account per plan tier" },
      { label: "Payout speed", value: "≤ 48 business hours" },
    ],
  },
  {
    id: "phidias",
    name: "Phidias Propfirm",
    source: "https://phidiaspropfirm.com/rules",
    kind: "allowed",
    minutesBefore: 0,
    minutesAfter: 0,
    fundedOnly: false,
    closeTimeET: "16:59",
    closeNote: "Fundamental & E2L: close before end of day. Premium: overnight/over-week allowed.",
    summary:
      "News trading allowed on all account types, at any time, with no blackout periods whatsoever.",
    verdict: "News trading allowed",
    rules: [
      { label: "Drawdown", value: "Static / EOD — never trailing", note: "floor never chases your balance" },
      { label: "Consistency", value: "30% — no day > 30% of total profit", note: "CASH funded only; over min. 4 days. None on E2L" },
      { label: "Profit target (Fundamental)", value: "$4,000 / $6,000 / $9,000", note: "by size" },
      { label: "Min. trading days", value: "3 (eval) / 10 (funded CASH)", note: "5 on Premium" },
      { label: "No automated / HFT", value: "Semi-auto allowed if manually monitored" },
      { label: "Profit split", value: "80 / 20 (up to 100% on Premium)" },
    ],
  },
];

export function getFirm(id: string): FirmRule | undefined {
  return FIRMS.find((f) => f.id === id);
}
