"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/accounts", label: "Accounts", icon: "🏦" },
  { href: "/bills", label: "Bills", icon: "🧾" },
  { href: "/transactions", label: "Spending", icon: "💳" },
  { href: "/subscriptions", label: "Subscriptions", icon: "🔁" },
  { href: "/forecast", label: "Forecast", icon: "📈" },
  { href: "/goals", label: "Savings", icon: "🎯" },
  { href: "/recovery", label: "Recovery", icon: "🧭" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const COMPACT_ITEMS = ["/home", "/bills", "/transactions", "/forecast", "/settings"];

export function NavLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const items = compact ? ITEMS.filter((i) => COMPACT_ITEMS.includes(i.href)) : ITEMS;

  return (
    <>
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              compact
                ? `flex flex-col items-center gap-0.5 px-2 text-[11px] ${active ? "text-gold" : "text-muted"}`
                : `rounded-lg px-3 py-2 text-sm ${active ? "bg-surface-raised text-gold" : "text-muted hover:text-ivory"}`
            }
          >
            {compact ? (
              <>
                <span aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </>
  );
}
