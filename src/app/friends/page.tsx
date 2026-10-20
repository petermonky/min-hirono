import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FriendsDirectory } from "@/components/friends-directory";
import { Icon } from "@/components/icon";
import { allReleasedItemIds } from "@/lib/catalog";
import { getFriendsDirectory } from "@/lib/friends-store";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Friends · your hirono" };

export default async function FriendsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const directory = await getFriendsDirectory(session.username);
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

        <FriendsDirectory initialData={directory} total={total} />
      </div>
    </main>
  );
}
