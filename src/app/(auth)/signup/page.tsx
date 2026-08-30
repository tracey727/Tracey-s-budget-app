"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type FormState } from "../actions";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: FormState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <Card>
      <h1 className="font-display text-2xl text-ivory">Create your account</h1>
      <p className="mt-1 text-sm text-muted">
        Start your first-time setup and see your money position in minutes.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Name
          </label>
          <Input id="name" name="name" autoComplete="name" required />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-status-red">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-status-red">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Password
          </label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-status-red">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          {state.fieldErrors?.confirmPassword && (
            <p className="mt-1 text-xs text-status-red">{state.fieldErrors.confirmPassword[0]}</p>
          )}
        </div>

        <label className="flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" name="agreeToTerms" className="mt-0.5" required />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" className="text-gold underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-gold underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {state.fieldErrors?.agreeToTerms && (
          <p className="-mt-2 text-xs text-status-red">{state.fieldErrors.agreeToTerms[0]}</p>
        )}

        {state.error && <p className="text-sm text-status-red">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-gold">
          Log in
        </Link>
      </p>
    </Card>
  );
}
