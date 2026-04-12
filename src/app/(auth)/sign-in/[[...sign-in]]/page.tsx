"use client";

import { useState } from "react";
import type { Route } from "next";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z" />
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function clerkError(err: unknown): string {
  const e = err as { errors?: Array<{ longMessage?: string; message?: string }> };
  return (
    e.errors?.[0]?.longMessage ??
    e.errors?.[0]?.message ??
    "Something went wrong. Please try again."
  );
}

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn || loading) return;
    setError(null);
    setLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      setError(clerkError(err));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signIn || loading) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Sign-in could not be completed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(clerkError(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            ProposalPilot
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="mt-1.5 text-sm text-foreground-muted">
            Welcome back. Let&apos;s win some bids.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-background-elevated p-6 shadow-sm">
          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2.5"
            onClick={() => void handleGoogleSignIn()}
            disabled={!isLoaded || loading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-foreground-dim">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email + password form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isLoaded || loading}
              loading={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-foreground-muted">
          Don&apos;t have an account?{" "}
          <Link
            href={"/sign-up" as Route}
            className="font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
