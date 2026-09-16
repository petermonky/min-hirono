"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="grid min-h-dvh bg-canvas-soft lg:grid-cols-2">
      <section className="flex min-h-[62dvh] items-center bg-black px-5 py-16 text-white md:px-12 lg:min-h-dvh lg:px-[8vw]">
        <div className="w-full max-w-lg">
          <div className="mb-16 flex items-center gap-3">
            <span className="grid size-10 place-items-center bg-primary text-white"><span className="pixel-label text-[10px]">H</span></span>
            <span className="text-lg font-black">Your Hirono</span>
          </div>
          <p className="mb-5 text-[10px] font-bold uppercase text-primary">Private collection</p>
          <h1 className="display-xl max-w-xl">Our little archive.</h1>
        </div>
      </section>

      <section className="flex items-center px-5 py-14 md:px-12 lg:px-[8vw]">
        <form onSubmit={unlock} className="w-full max-w-md" aria-describedby={error ? "passcode-error" : undefined}>
          <p className="text-[10px] font-bold uppercase text-secondary">Welcome back</p>
          <h2 className="mt-3 display-sm">Unlock the collection</h2>
          <label htmlFor="archive-passcode" className="mt-10 block text-[10px] font-bold uppercase text-secondary">Passcode</label>
          <input
            id="archive-passcode"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            className="mt-3 h-14 w-full border border-hairline-strong bg-white px-4 text-base outline-none transition-colors hover:border-ink focus:border-focus"
          />
          <div className="mt-3 min-h-5" aria-live="polite">
            {error && <p id="passcode-error" className="text-xs font-medium text-error">{error}</p>}
          </div>
          <button type="submit" disabled={submitting || !passcode} className="chunky-button mt-5 h-14 w-full border-black bg-black px-6 text-xs font-bold uppercase text-white hover:bg-primary">
            {submitting ? "Unlocking…" : "Enter archive"}
          </button>
          <p className="mt-5 text-xs leading-5 text-secondary">This device will stay unlocked for 30 days.</p>
        </form>
      </section>
    </main>
  );
}
