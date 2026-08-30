"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "../actions";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: FormState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <Card>
      <h1 className="font-display text-2xl text-ivory">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to see your Safe-to-Spend position.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Password
          </label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>

        {state.error && <p className="text-sm text-status-red">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to Genevieve?{" "}
        <Link href="/signup" className="text-gold">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
