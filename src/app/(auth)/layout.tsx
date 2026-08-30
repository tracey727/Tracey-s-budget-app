import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 py-12">
      <Link href="/" className="mb-8 text-2xl tracking-wide text-ivory">
        <Logo size={34} />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
