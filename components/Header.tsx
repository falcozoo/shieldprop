import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tightish text-ink">
          <ShieldMark />
          <span className="text-[17px]">ShieldProp</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="#features" className="transition-colors hover:text-ink">Features</a>
          <a href="#how" className="transition-colors hover:text-ink">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-ink">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden text-sm font-medium text-ink transition-colors hover:text-muted sm:inline"
          >
            Sign in
          </a>
          <a
            href="#pricing"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
          >
            Start free
          </a>
        </div>
      </div>
    </header>
  );
}

function ShieldMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10v-6L12 2.5Z"
        stroke="#131722"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.6 12.2l2.3 2.3 4.5-4.7" stroke="#2f7d4f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
