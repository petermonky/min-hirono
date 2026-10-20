"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icon";
import type { Friend, FriendsDirectoryData, UserSearchResult } from "@/lib/friends-store";

function ProfileRow({ person, total, children }: { person: Friend; total: number; children?: React.ReactNode }) {
  const percent = total ? Math.round(person.ownedCount / total * 100) : 0;
  return <div className="flex items-center gap-4 py-5">
    <Avatar username={person.username} path={person.avatar_path} className="size-12 border border-hairline" iconClassName="size-5" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-4">
        <span className="min-w-0 break-all text-sm font-semibold">{person.username}</span>
        <div className="flex h-4 shrink-0 items-center justify-end">{children}</div>
      </div>
      <div className="mb-3 mt-3 flex items-end justify-between gap-3 text-xs tabular-nums">
        <span className="text-secondary">{person.ownedCount} / {total} collected</span>
        <strong className="font-semibold">{percent}%</strong>
      </div>
      <div className="progress-track" role="progressbar" aria-label={`${person.username} collection progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${person.ownedCount} of ${total} collected`}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  </div>;
}

export function FriendsDirectory({ initialData, total }: { initialData: FriendsDirectoryData; total: number }) {
  const router = useRouter();
  const [directory, setDirectory] = useState(initialData);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const [searchResult, setSearchResult] = useState<{ query: string; users: UserSearchResult[] }>({ query: "", users: [] });
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const pending = useRef(new Set<string>());
  const refreshVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    const response = await fetch("/api/friends", { cache: "no-store" });
    if (response.status === 401) { router.push("/"); return; }
    if (!response.ok) throw new Error("Could not refresh your friends.");
    const data: FriendsDirectoryData = await response.json();
    if (version === refreshVersion.current) setDirectory(data);
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    if (normalizedQuery.length < 2) return;
    const timer = window.setTimeout(() => {
      void fetch(`/api/friends/search?q=${encodeURIComponent(normalizedQuery)}`, { signal: controller.signal, cache: "no-store" })
        .then(async (response) => {
          if (response.status === 401) router.push("/");
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Could not search for users.");
          if (!controller.signal.aborted) setSearchResult({ query: normalizedQuery, users: result.users });
        }).catch((caught) => {
          if (!controller.signal.aborted) setSearchError(caught instanceof Error ? caught.message : "Could not search for users.");
        }).finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [normalizedQuery, revision, router]);

  useEffect(() => {
    const update = () => {
      if (document.visibilityState !== "visible" || pending.current.size) return;
      void refresh().catch(() => setError("Could not refresh your friends."));
      setRevision((current) => current + 1);
    };
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    const timer = window.setInterval(update, 30_000);
    return () => {
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
      window.clearInterval(timer);
      refreshVersion.current += 1;
    };
  }, [refresh]);

  const action = async (key: string, body: { username: string } | { id: string; action: "accept" | "reject" }) => {
    if (pending.current.has(key)) return;
    pending.current.add(key);
    refreshVersion.current += 1;
    setBusy(new Set(pending.current));
    setError(""); setMessage("");
    try {
      const response = await fetch("/api/friends/invites", {
        method: "username" in body ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.status === 401) router.push("/");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the invitation.");
      await refresh();
      setMessage("username" in body ? "Invitation sent." : body.action === "accept" ? "Friend added." : "Invitation declined.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the invitation.");
      await refresh().catch(() => undefined);
    } finally {
      pending.current.delete(key);
      setBusy(new Set(pending.current));
      setSearching(normalizedQuery.length >= 2);
      setRevision((current) => current + 1);
    }
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    if (value.trim().toLowerCase() !== normalizedQuery) {
      setSearchError("");
      setSearching(value.trim().length >= 2);
    }
  };
  const results = searchResult.query === normalizedQuery ? searchResult.users : [];

  return <section className="mx-auto w-full max-w-md pt-4 md:pt-6" aria-labelledby="friends-title">
    <div className="sticky top-16 z-30 -mx-5 bg-canvas/95 px-5 pb-5 pt-3 backdrop-blur-md md:mx-0 md:px-0">
      <h1 id="friends-title" className="display-sm mb-5">Friends</h1>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-secondary" />
        <label htmlFor="friends-search" className="sr-only">Search for a user</label>
        <input id="friends-search" type="search" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Search for a user…" autoComplete="off" autoCapitalize="none" spellCheck={false} className="h-11 w-full border border-hairline-strong bg-surface pl-12 pr-4 text-xs outline-none transition-colors placeholder:text-mute hover:border-ink focus:border-focus" />
      </div>
    </div>

    {error && <p role="alert" className="mt-4 text-xs text-error">{error}</p>}
    {message && <p role="status" className="mt-4 text-xs text-success">{message}</p>}

    {normalizedQuery && <section className="mt-2" aria-labelledby="user-search-title" aria-busy={searching}>
      <h2 id="user-search-title" className="mb-2 text-[10px] font-bold uppercase text-mute">Search results</h2>
      {normalizedQuery.length < 2 ? <p className="py-5 text-xs text-secondary">Type at least 2 characters.</p>
        : searchError ? <p role="alert" className="py-5 text-xs text-error">{searchError}</p>
        : searching ? <p role="status" className="py-5 text-xs text-secondary">Searching…</p>
        : !results.length ? <p role="status" className="py-5 text-xs text-secondary">No users found.</p>
        : <ul className="divide-y divide-hairline border-y border-hairline">
          {results.map((person) => <li key={person.username}>
            {person.relationship === "friend" ? <Link href={`/friends/${encodeURIComponent(person.username)}`} aria-label={`View ${person.username}’s collection`}>
              <ProfileRow person={person} total={total}><Icon name="chevron" className="size-4 shrink-0 -rotate-90 text-mute" /></ProfileRow>
            </Link> : person.relationship === "none" ? <div className="relative">
              <ProfileRow person={person} total={total}><Icon name="plus" className="size-4 shrink-0 text-mute" /></ProfileRow>
              <button type="button" onClick={() => void action(`send:${person.username}`, { username: person.username })} disabled={busy.has(`send:${person.username}`)} aria-label={`Send friend invite to ${person.username}`} aria-busy={busy.has(`send:${person.username}`)} className="absolute inset-0 w-full" />
            </div> : <ProfileRow person={person} total={total}>
              <span className="max-w-16 text-[10px] font-bold uppercase text-mute">{person.relationship === "outgoing" ? "Invited" : "Invite received"}</span>
            </ProfileRow>}
          </li>)}
        </ul>}
    </section>}

    {directory.invitations.length > 0 && <section className={normalizedQuery ? "mt-8" : "mt-2"} aria-labelledby="friend-invites-title">
      <h2 id="friend-invites-title" className="mb-2 text-[10px] font-bold uppercase text-mute">Invites</h2>
      <ul className="divide-y divide-hairline border-y border-hairline">
        {directory.invitations.map((invite) => <li key={invite.id}>
          <ProfileRow person={invite} total={total}>
            <div className="-mr-3.5 flex shrink-0">
              <button type="button" disabled={busy.has(invite.id)} onClick={() => void action(invite.id, { id: invite.id, action: "accept" })} aria-label={`Accept friend invite from ${invite.username}`} className="grid size-11 place-items-center text-mute"><Icon name="check" className="size-4" /></button>
              <button type="button" disabled={busy.has(invite.id)} onClick={() => void action(invite.id, { id: invite.id, action: "reject" })} aria-label={`Reject friend invite from ${invite.username}`} className="grid size-11 place-items-center text-mute"><Icon name="x" className="size-4" /></button>
            </div>
          </ProfileRow>
        </li>)}
      </ul>
    </section>}

    <section className={directory.invitations.length || normalizedQuery ? "mt-8" : "mt-2"} aria-labelledby="current-friends-title">
      <h2 id="current-friends-title" className="mb-2 text-[10px] font-bold uppercase text-mute">Current friends</h2>
      {directory.friends.length ? <ul className="divide-y divide-hairline border-y border-hairline">
        {directory.friends.map((friend) => <li key={friend.username}>
          <Link href={`/friends/${encodeURIComponent(friend.username)}`} aria-label={`View ${friend.username}’s collection`}>
            <ProfileRow person={friend} total={total}><Icon name="chevron" className="size-4 shrink-0 -rotate-90 text-mute" /></ProfileRow>
          </Link>
        </li>)}
      </ul> : <p className="border-y border-hairline py-8 text-sm text-secondary">No friends yet.</p>}
    </section>
  </section>;
}
