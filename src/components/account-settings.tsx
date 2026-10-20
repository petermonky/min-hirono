"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { Avatar } from "@/components/avatar";
import { AvatarEditor } from "@/components/avatar-editor";

const MASKED_PASSWORD = "••••••••••••";

export function AccountSettings({ username, initialAvatarPath }: { username: string; initialAvatarPath: string | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPath, setAvatarPath] = useState(initialAvatarPath);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState("");
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
          <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Change profile picture" className="relative rounded-full border border-ink">
            <Avatar path={avatarPath} className="size-28" iconClassName="size-11" />
            <span className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full border border-ink bg-ink text-canvas ring-4 ring-canvas" aria-hidden="true">
              <Icon name="camera" className="size-4" />
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Choose profile picture" onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setAvatarError("");
            if (file.size > 10 * 1024 * 1024) { setAvatarError("Choose an image smaller than 10 MB."); return; }
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setAvatarError("Choose a JPEG, PNG, or WebP image."); return; }
            setAvatarFile(file);
          }} />
          {avatarError && <p role="alert" className="mt-3 text-xs text-error">{avatarError}</p>}
          {avatarFile && <AvatarEditor file={avatarFile} onCancel={() => setAvatarFile(null)} onSaved={(path) => {
            setAvatarPath(path);
            setAvatarFile(null);
            setMessage("Profile picture updated.");
            router.refresh();
          }} />}

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
