"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resendConfirmation } from "@/lib/api/auth";

function parseHash(hash: string) {
  // hash is like "#error=access_denied&error_code=otp_expired&error_description=..."
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(h);
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const code = sp.get("code");

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const hashParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return parseHash(window.location.hash);
  }, []);

  const errorCode = hashParams.get("error_code");
  const errorDescription = hashParams.get("error_description");

  useEffect(() => {
    async function run() {
      // If we have an error in the hash, show it and do not attempt exchange.
      if (errorCode) {
        toast.error(
          errorCode === "otp_expired"
            ? "This email link has expired or was already used. Resend confirmation."
            : decodeURIComponent(errorDescription || "Authentication failed")
        );
        return;
      }

      // If we have a code, exchange it for a session cookie.
      if (code) {
        setBusy(true);
        const res = await fetch(`/api/auth/exchange?code=${encodeURIComponent(code)}`, {
          method: "GET",
        });
        const data = await res.json().catch(() => ({}));
        setBusy(false);

        if (!res.ok) {
          toast.error(data?.error ?? "Failed to complete sign-in");
          router.replace("/login");
          return;
        }

        router.replace(next);
        return;
      }

      // No code and no error => send user to login
      router.replace("/login");
    }

    run();
  }, [code, errorCode, errorDescription, next, router]);

  async function onResend() {
    try {
      setBusy(true);
      await resendConfirmation(email);
      toast.success("Confirmation email resent. Check your inbox.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to resend email");
    } finally {
      setBusy(false);
    }
  }

  // If error is present, show a simple resend UI.
  if (errorCode) {
    return (
      <div className="mx-auto max-w-md space-y-3">
        <h1 className="text-xl font-semibold">Email link not valid</h1>
        <p className="text-sm text-muted-foreground">
          {errorCode === "otp_expired"
            ? "That link expired or was already used."
            : decodeURIComponent(errorDescription || "Authentication failed.")}
        </p>

        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button
            className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
            onClick={onResend}
            disabled={busy || !email}
          >
            {busy ? "Sending…" : "Resend confirmation email"}
          </button>

          <a className="block text-sm underline" href="/login">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <p>{busy ? "Completing sign-in…" : "Redirecting…"}</p>
    </div>
  );
}
