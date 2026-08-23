/**
 * ShieldProp — Prop firm news-trading rules (curated, owned dataset).
 *
 * WHY THIS IS HAND-CURATED (not scraped live):
 * Firm news rules live in prose on each firm's FAQ/rules page and change when
 * the firm decides. Displaying a stale rule = a trader gets eliminated = our
 * liability. So the source of truth is THIS file, which we own. A separate IA
 * cron watches each firm's rules page and alerts the operator on change → the
 * operator confirms in ~30s → this file is updated → it propagates everywhere.
 *
 * Sources verified 2026-08-21 / 2026-08-23 (see SKILL falco-saas-propguard).
 *
 * MODEL:
 *  - `blackout` firms impose a hard flat window (minutesBefore/minutesAfter a
 *    high-impact event). This is where the red windows come from.
 *  - `fundedOnly` means the blackout applies ONLY to funded accounts, not
 *    evaluation. That's why the dashboard has a per-firm "funded?" toggle.
 *  - `allowed` / `caution` firms never produce a hard red window.
 */

export type FirmRuleKind = "blackout" | "caution" | "allowed";

export interface FirmRule {
  id: string;
  name: string;
  /** Public rules page (for the IA watcher + user reference link). */
  source: string;
  kind: FirmRuleKind;
  /** Minutes flat BEFORE a high-impact event (only for kind="blackout"). */
  minutesBefore: number;
  /** Minutes flat AFTER a high-impact event (only for kind="blackout"). */
  minutesAfter: number;
  /**
   * If true, the blackout applies only when the user's account is FUNDED.
   * On evaluation the firm imposes no news window → no red block.
   */
  fundedOnly: boolean;
  /** Short human explanation shown under the firm in the picker. */
  summary: string;
  /** One-line verdict badge text. */
  verdict: string;
}

export const FIRMS: FirmRule[] = [
  {
    id: "topstep",
    name: "Topstep",
    source:
      "https://help.topstep.com/en/articles/8284211-economic-releases",
    kind: "caution",
    minutesBefore: 0,
    minutesAfter: 0,
    fundedOnly: false,
    summary:
      "No mandatory flat window. But trading max size during a major release is a prohibited strategy — reduce size around news.",
    verdict: "Caution around news (no hard flatten)",
  },
  {
    id: "apex",
    name: "Apex Trader Funding",
    source:
      "https://apextraderfunding.com/help-center/getting-started/prohibited-activities/",
    kind: "allowed",
    minutesBefore: 0,
    minutesAfter: 0,
    fundedOnly: false,
    summary:
      "News trading allowed with a normal strategy. Only bidirectional 'gambling' on the outcome is prohibited.",
    verdict: "News trading allowed",
  },
  {
    id: "takeprofittrader",
    name: "Take Profit Trader",
    source:
      "https://takeprofittraderhelp.zendesk.com/hc/en-us/articles/15171769361053-PRO-Account-Rules",
    kind: "blackout",
    minutesBefore: 1,
    minutesAfter: 1,
    fundedOnly: true,
    summary:
      "On funded PRO/PRO+ accounts: be flat with no open orders 1 min before, during, and 1 min after high-impact events. Evaluation is unrestricted.",
    verdict: "Funded: flat 1 min before/after",
  },
  {
    id: "tradeify",
    name: "Tradeify",
    source: "https://help.tradeify.co/en/articles/10495874-rules-news-trading",
    kind: "allowed",
    minutesBefore: 0,
    minutesAfter: 0,
    fundedOnly: false,
    summary:
      "News trading allowed with no time window on all accounts. (An unrelated micro-scalping payout rule still applies.)",
    verdict: "News trading allowed",
  },
  {
    id: "alphafutures",
    name: "Alpha Futures",
    source:
      "https://help.alpha-futures.com/en/articles/9492063-news-trading-policy",
    kind: "blackout",
    minutesBefore: 2,
    minutesAfter: 2,
    fundedOnly: true,
    summary:
      "On funded Direct/Standard/Zero accounts: no order executed 2 min before or 2 min after a high-impact event. Evaluation and Advanced are unrestricted.",
    verdict: "Funded: flat 2 min before/after",
  },
  {
    id: "phidias",
    name: "Phidias Propfirm",
    source: "https://phidiaspropfirm.com/news-trading",
    kind: "allowed",
    minutesBefore: 0,
    minutesAfter: 0,
    fundedOnly: false,
    summary:
      "News trading allowed on all account types, at any time, with no blackout periods whatsoever.",
    verdict: "News trading allowed",
  },
];

export function getFirm(id: string): FirmRule | undefined {
  return FIRMS.find((f) => f.id === id);
}
