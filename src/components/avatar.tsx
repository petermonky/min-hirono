"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icon";

export function Avatar({ path, username, className, iconClassName }: { path: string | null; username?: string; className: string; iconClassName: string }) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ${className}`}>
      {path && failedPath !== path ? (
        <Image src={`/api/account/avatar?v=${encodeURIComponent(path)}&username=${encodeURIComponent(username ?? path.split("/")[0])}`} alt="" fill unoptimized className="object-cover" onError={() => setFailedPath(path)} />
      ) : <Icon name="user" className={iconClassName} />}
    </span>
  );
}
