import { AccessGate } from "@/components/access-gate";
import { CollectionMuseum } from "@/components/collection-museum";
import { getOwnedCollectibleIds } from "@/lib/collection-store";
import { releases } from "@/lib/catalog";
import { hasValidSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await hasValidSession())) return <AccessGate />;
  const initialOwned = await getOwnedCollectibleIds();
  return <CollectionMuseum releases={releases} initialOwned={initialOwned} />;
}
