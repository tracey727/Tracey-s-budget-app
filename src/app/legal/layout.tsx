import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-border px-6 py-4">
        <Link href="/" className="text-xl text-ivory">
          <Logo size={28} />
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <article className="prose-legal text-ivory">{children}</article>
      </main>
    </div>
  );
}
