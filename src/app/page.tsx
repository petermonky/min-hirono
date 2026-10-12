import { AccessGate } from "@/components/access-gate";
import { CollectionMuseum } from "@/components/collection-museum";
import { getOwnedCollectibleIds } from "@/lib/collection-store";
import { releases } from "@/lib/catalog";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (!session) return <AccessGate />;
  const initialOwned = await getOwnedCollectibleIds(session.username);
  return <CollectionMuseum releases={releases} initialOwned={initialOwned} username={session.username} />;
}
