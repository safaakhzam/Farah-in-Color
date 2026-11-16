"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { sendLoginLink, signIn } from "@/actions/admin";
import type { FormState } from "@/lib/validation";

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "password" ? signIn : sendLoginLink, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" defaultValue={state.values?.email} />
      </div>
      {mode === "password" && (
        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
        </div>
      )}
      {state.error && <p role="alert" className="field-error">{state.error}</p>}
      {state.ok && mode === "link" && (
        <p role="status" className="rounded-xl bg-teal/10 px-3 py-2 text-sm text-teal-deep">
          If this email has an account, a login link is on its way. Check your inbox.
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "password" ? "Log in" : "Email me a login link"}
      </button>
      <button type="button" onClick={() => setMode(mode === "password" ? "link" : "password")} className="w-full text-center text-sm text-muted underline underline-offset-4">
        {mode === "password" ? "Forgot your password?" : "Log in with password instead"}
      </button>
    </form>
  );
}
