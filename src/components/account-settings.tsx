"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/icon";

const MASKED_PASSWORD = "••••••••••••";

export function AccountSettings({ username }: { username: string }) {
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const closeForm = () => {
    setEditing(false);
    setPassword("");
    setConfirmation("");
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6 || password.length > 256) {
      setError("Password must be between 6 and 256 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, confirmPassword: confirmation }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not change your password.");
      closeForm();
      setMessage("Password changed.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not change your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-40 bg-canvas">
        <nav className="border-b border-hairline" aria-label="Primary navigation">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center px-5 md:px-8">
            <Link href="/" className="flex items-center" aria-label="your hirono home">
              <Image src="/brand/hirono-head.png" alt="" width={36} height={36} className="size-9 object-contain" priority />
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-6 md:px-8 md:pb-28 md:pt-8">
        <Link href="/" className="inline-flex h-11 items-center gap-3 text-[10px] font-bold uppercase" aria-label="Back to collection">
          <Icon name="arrow" className="size-4 rotate-180" />
          Collection
        </Link>

        <section className="mx-auto flex w-full max-w-md flex-col items-center pb-10 pt-9 md:pt-12">
          <h1 className="sr-only">Account settings</h1>
          <div className="grid size-28 place-items-center rounded-full border border-ink" aria-hidden="true">
            <Icon name="user" className="size-11" />
          </div>

          <dl className="mt-10 w-full border-y border-hairline">
            <div className="flex min-h-14 items-center justify-between gap-6 border-b border-hairline py-3">
              <dt className="text-xs text-secondary">Username</dt>
              <dd className="font-semibold">{username}</dd>
            </div>
            <div className="flex min-h-14 items-center justify-between gap-6 py-3">
              <dt className="text-xs text-secondary">Password</dt>
              <dd className="font-semibold tracking-[0.2em]" aria-label="Password hidden">{MASKED_PASSWORD}</dd>
            </div>
          </dl>

          {!editing ? (
            <button type="button" onClick={() => { setEditing(true); setMessage(""); }} className="chunky-button mt-8 h-11 w-full border-ink bg-ink px-5 text-[10px] uppercase text-canvas">
              Change password
            </button>
          ) : (
            <form onSubmit={submit} className="mt-8 w-full" noValidate>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase text-secondary">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={256}
                required
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-3 h-14 w-full border border-hairline-strong bg-surface px-4 text-base outline-none transition-colors hover:border-ink focus:border-focus"
              />

              <label htmlFor="confirm-password" className="mt-5 block text-[10px] font-bold uppercase text-secondary">Confirm password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={256}
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="mt-3 h-14 w-full border border-hairline-strong bg-surface px-4 text-base outline-none transition-colors hover:border-ink focus:border-focus"
              />

              <p className="mt-3 min-h-5 text-xs text-error" role="alert">{error}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={closeForm} disabled={submitting} className="chunky-button h-11 bg-canvas text-[10px] uppercase">Cancel</button>
                <button type="submit" disabled={submitting || !password || !confirmation} className="chunky-button h-11 border-ink bg-ink text-[10px] uppercase text-canvas">
                  {submitting ? "Saving…" : "Save password"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-5 min-h-5 text-xs text-success" role="status" aria-live="polite">{message}</p>
        </section>
      </div>
    </main>
  );
}
