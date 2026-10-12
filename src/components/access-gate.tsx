"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AccessGate() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not sign in.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 py-14 md:px-12">
      <section className="w-full max-w-md">
        <form onSubmit={signIn} className="w-full max-w-md" aria-describedby={error ? "account-error" : undefined}>
          <h1 className="sr-only">your hirono</h1>
          <Image src="/brand/hirono-head.png" alt="" width={48} height={48} className="mx-auto size-12 object-contain" priority />
          <label htmlFor="account-username" className="mt-10 block text-[10px] font-bold uppercase text-secondary">Username</label>
          <input
            id="account-username"
            type="text"
            autoComplete="username"
            required
            autoFocus
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-3 h-14 w-full border border-hairline-strong bg-surface px-4 text-base outline-none transition-colors hover:border-ink focus:border-focus"
          />
          <label htmlFor="account-password" className="mt-5 block text-[10px] font-bold uppercase text-secondary">Password</label>
          <input
            id="account-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-3 h-14 w-full border border-hairline-strong bg-surface px-4 text-base outline-none transition-colors hover:border-ink focus:border-focus"
          />
          <div className="mt-3 min-h-5" aria-live="polite">
            {error && <p id="account-error" className="text-xs font-medium text-error">{error}</p>}
          </div>
          <button type="submit" disabled={submitting} className="chunky-button mt-5 h-11 w-full border-ink bg-ink px-5 text-[10px] uppercase text-canvas">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
