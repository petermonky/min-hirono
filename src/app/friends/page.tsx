import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icon";
import { allReleasedItemIds } from "@/lib/catalog";
import { getFriends } from "@/lib/friends-store";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Friends · your hirono" };

export default async function FriendsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const friends = (await getFriends()).filter((friend) => friend.username !== session.username);
  const total = allReleasedItemIds.size;

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

        <section className="mx-auto w-full max-w-md pt-9 md:pt-12" aria-labelledby="friends-title">
          <h1 id="friends-title" className="display-sm mb-8">Friends</h1>
          <ul className="divide-y divide-hairline border-y border-hairline">
            {friends.map((friend) => {
              const percent = total ? Math.round(friend.ownedCount / total * 100) : 0;
              return <li key={friend.username} className="flex items-center gap-4 py-5">
                <Avatar username={friend.username} path={friend.avatar_path} className="size-12 border border-hairline" iconClassName="size-5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="min-w-0 break-all text-sm font-semibold">{friend.username}</span>
                  </div>
                  <div className="mb-3 mt-3 flex items-end justify-between gap-3 text-xs tabular-nums">
                    <span className="text-secondary">{friend.ownedCount} / {total} collected</span>
                    <strong className="font-semibold">{percent}%</strong>
                  </div>
                  <div className="progress-track" role="progressbar" aria-label={`${friend.username} collection progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${friend.ownedCount} of ${total} collected`}>
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </li>;
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
