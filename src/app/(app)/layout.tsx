import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/ui/Logo";
import { NavLinks } from "./NavLinks";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  if (!user.onboardingComplete) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-ink">
      <aside className="hidden w-64 flex-col border-r border-border px-6 py-8 lg:flex">
        <Link href="/home" className="text-lg text-ivory">
          <Logo size={26} compact />
        </Link>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted">{user.tier} tier</p>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          <NavLinks />
        </nav>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="text-sm text-muted hover:text-ivory">
            Sign out
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <Link href="/home" className="text-lg text-ivory">
            <Logo size={24} compact />
          </Link>
          <Link href="/settings" className="text-sm text-muted">
            {user.name ?? user.email}
          </Link>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 pb-24 lg:px-8 lg:pb-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-border bg-surface py-2 lg:hidden">
          <NavLinks compact />
        </nav>
      </div>
    </div>
  );
}
