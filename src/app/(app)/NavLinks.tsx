"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: React.ReactNode }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  home: (props) => (
    <Icon {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </Icon>
  ),
  accounts: (props) => (
    <Icon {...props}>
      <rect x="3.5" y="9" width="17" height="10" rx="1.5" />
      <path d="M6 9 12 4l6 5" />
      <path d="M9 14h1" />
    </Icon>
  ),
  bills: (props) => (
    <Icon {...props}>
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </Icon>
  ),
  spending: (props) => (
    <Icon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14.5h4" />
    </Icon>
  ),
  subscriptions: (props) => (
    <Icon {...props}>
      <path d="M4 12a8 8 0 0 1 13.5-5.8L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.5 5.8L4 16" />
      <path d="M4 20v-4h4" />
    </Icon>
  ),
  forecast: (props) => (
    <Icon {...props}>
      <path d="M4 18 9 12l4 3 7-8" />
      <path d="M15 7h5v5" />
    </Icon>
  ),
  savings: (props) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
    </Icon>
  ),
  recovery: (props) => (
    <Icon {...props}>
      <path d="M4 12a8 8 0 1 1 3 6.2" />
      <path d="M4 18v-4h4" />
    </Icon>
  ),
  settings: (props) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.14.5.5.94 1 1.09.32.1.66.1.51.1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Icon>
  ),
};

const ITEMS = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/accounts", label: "Accounts", icon: "accounts" },
  { href: "/bills", label: "Bills", icon: "bills" },
  { href: "/transactions", label: "Spending", icon: "spending" },
  { href: "/subscriptions", label: "Subscriptions", icon: "subscriptions" },
  { href: "/forecast", label: "Forecast", icon: "forecast" },
  { href: "/goals", label: "Savings", icon: "savings" },
  { href: "/recovery", label: "Recovery", icon: "recovery" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

const COMPACT_ITEMS = ["/home", "/bills", "/transactions", "/forecast", "/settings"];

export function NavLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const items = compact ? ITEMS.filter((i) => COMPACT_ITEMS.includes(i.href)) : ITEMS;

  return (
    <>
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const IconComponent = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              compact
                ? `flex flex-col items-center gap-1 px-2 text-[11px] ${active ? "text-gold" : "text-muted"}`
                : `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? "bg-surface-raised text-gold" : "text-muted hover:text-ivory"}`
            }
          >
            <IconComponent />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
