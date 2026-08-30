import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-border px-6 py-4">
        <Link href="/" className="font-display text-xl text-ivory">
          Genevieve<span className="text-gold">.</span>
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <article className="prose-legal text-ivory">{children}</article>
      </main>
    </div>
  );
}
