"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function AccessGate() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not unlock the archive.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not unlock the archive.");
      setSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-dvh place-items-center bg-canvas px-5 py-14 md:px-12">
      <ThemeToggle className="absolute right-5 top-5 md:right-8 md:top-8" />
      <section className="w-full max-w-md">
        <form onSubmit={unlock} className="w-full max-w-md" aria-describedby={error ? "passcode-error" : undefined}>
          <h1 className="sr-only">Your Hirono</h1>
          <Image src="/brand/hirono-head.png" alt="" width={112} height={112} className="mx-auto size-28 object-contain" priority />
          <label htmlFor="archive-passcode" className="mt-10 block text-[10px] font-bold uppercase text-secondary">Passcode</label>
          <input
            id="archive-passcode"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            className="mt-3 h-14 w-full border border-hairline-strong bg-surface px-4 text-base outline-none transition-colors hover:border-ink focus:border-focus"
          />
          <div className="mt-3 min-h-5" aria-live="polite">
            {error && <p id="passcode-error" className="text-xs font-medium text-error">{error}</p>}
          </div>
          <button type="submit" disabled={submitting || !passcode} className="chunky-button mt-5 h-14 w-full border-ink bg-ink px-6 text-xs font-bold uppercase text-canvas hover:border-primary hover:bg-primary hover:text-on-primary">
            {submitting ? "Unlocking…" : "Enter archive"}
          </button>
        </form>
      </section>
    </main>
  );
}
