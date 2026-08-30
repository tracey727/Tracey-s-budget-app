"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import type { TierId } from "@/lib/product";

export function SubscribeButton({ tier }: { tier: TierId }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await fetch("/api/stripe/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tier }),
            });
            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
            } else {
              setError(data.error ?? "Something went wrong.");
            }
          })
        }
      >
        {pending ? "Redirecting…" : `Subscribe to ${tier === "PERSONAL" ? "Personal" : "Professional"}`}
      </Button>
      {error && <p className="mt-2 text-xs text-status-red">{error}</p>}
    </div>
  );
}

export function ManageBillingButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await fetch("/api/stripe/portal", { method: "POST" });
            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
            } else {
              setError(data.error ?? "Something went wrong.");
            }
          })
        }
      >
        {pending ? "Redirecting…" : "Manage billing"}
      </Button>
      {error && <p className="mt-2 text-xs text-status-red">{error}</p>}
    </div>
  );
}
