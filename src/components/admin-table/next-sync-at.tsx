import { useInterval } from "@/lib/use-interval";
import { useState, useEffect, useMemo } from "react";

export interface NextSyncAtProps {
  lastSyncedAt: Date | null;
  syncInterval: number | null;
}

export function NextSyncAt(props: NextSyncAtProps) {
  const { lastSyncedAt = new Date(), syncInterval } = props;
  const [now, setNow] = useState(Date.now());

  useInterval(() => {
    setNow(Date.now());
  }, 1000);

  const timeTillNextSync = useMemo(() => {
    if (!lastSyncedAt || !syncInterval) return null;
    return lastSyncedAt.getTime() + syncInterval - now;
  }, [lastSyncedAt, syncInterval, now]);

  if (!timeTillNextSync) return null;

  return (
    <>
      <span className="inline-flex min-w-[85px] items-center justify-center px-1 text-muted-foreground">
        Next in
        <span className="ml-1 min-w-[10px] font-semibold">
          {(timeTillNextSync / 1000).toFixed(0)}s
        </span>
      </span>
    </>
  );
}
