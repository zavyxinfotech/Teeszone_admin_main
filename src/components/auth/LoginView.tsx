"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormRow } from "@/components/shared/FormRow";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const safeNext = (raw: string | null) => (raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/");

export function LoginView() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; description?: string } | null>(null);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace(next);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? { message: err.message, description: err.description }
          : { message: "Could not sign in", description: (err as Error).message },
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <Image src="/logo.png" alt="TeesZone" width={140} height={42} className="h-9 w-auto" priority />
          <span className="flex items-center gap-1 rounded bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <LockKeyhole size={11} /> Admin
          </span>
        </div>
        <h1 className="mt-6 text-xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use your TeesZone admin account.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <FormRow label="Email" htmlFor="email" required>
            <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormRow>
          <FormRow label="Password" htmlFor="password" required>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormRow>
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p className="font-medium text-destructive">{error.message}</p>
              {error.description && <p className="mt-0.5 text-xs text-muted-foreground">{error.description}</p>}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Forgot your password? Reset it on the storefront, then sign in here.
        </p>
      </div>
    </div>
  );
}
