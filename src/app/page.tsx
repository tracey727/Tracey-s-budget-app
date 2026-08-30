import Link from "next/link";
import { LinkButton } from "@/components/ui/LinkButton";
import { Card } from "@/components/ui/Card";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { BRAND, LEGAL_ENTITY, NOT_ADVICE_DISCLAIMER, TIERS } from "@/lib/product";

export default function LandingPage() {
  return (
    <div className="flex-1 bg-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl tracking-wide text-ivory">
          <Logo size={30} />
        </span>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/login" className="text-muted hover:text-ivory">
            Log in
          </Link>
          <LinkButton href="/signup" className="px-5 py-2 text-sm">
            Get started
          </LinkButton>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20 text-center">
        <LogoMark size={64} className="mx-auto mb-8" />
        <p className="gold-underline mb-6 inline-block text-xs uppercase tracking-[0.3em] text-gold">
          One app · Two tiers · One money engine
        </p>
        <h1 className="font-display text-4xl leading-tight text-ivory sm:text-5xl">
          {BRAND.tagline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          {BRAND.name} is a calm, high-class money command centre for ordinary people and
          professional/business users — never a spreadsheet, never a punishment.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <LinkButton href="/signup" className="px-8 py-4 text-base">
            Start your account
          </LinkButton>
          <LinkButton href="#pricing" variant="secondary" className="px-8 py-4 text-base">
            See pricing
          </LinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Safe-to-Spend", body: "The one number that matters: what you can spend today without stealing from bills or goals." },
            { title: "Bills Protection", body: "Every bill reserved before discretionary spending — funded, at risk, or overdue, always visible." },
            { title: "Forecasting", body: "See shortfalls before they happen, and test scenarios without touching your real ledger." },
            { title: "Recovery", body: "Back to Zero is a controlled path back to stability — never a label of failure." },
          ].map((f) => (
            <Card key={f.title}>
              <h3 className="font-display text-lg text-gold-light">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl text-ivory">One engine. Two doors.</h2>
          <p className="mt-3 text-muted">
            Personal and Professional share the same trusted money engine — every user gets the same
            premium experience.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {Object.values(TIERS).map((tier) => (
            <Card key={tier.id} className="flex flex-col">
              <h3 className="font-display text-2xl text-ivory">{tier.label}</h3>
              <p className="mt-1 text-sm text-muted">{tier.description}</p>
              <p className="mt-6 font-display text-3xl text-gold">{tier.priceLabel}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-gold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="/signup" className="mt-8">
                Choose {tier.label}
              </LinkButton>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Prices shown in AUD. Cancel anytime. {NOT_ADVICE_DISCLAIMER}
        </p>
      </section>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} {LEGAL_ENTITY.businessName}. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link href="/legal/terms" className="hover:text-ivory">
              Terms &amp; Conditions
            </Link>
            <Link href="/legal/privacy" className="hover:text-ivory">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
