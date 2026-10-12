import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/account-settings";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings · your hirono",
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  return <AccountSettings username={session.username} />;
}
