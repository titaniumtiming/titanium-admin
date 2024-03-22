import { useInterval } from "@/lib/use-interval";
import { useGlobalStore } from "@/store";
import { useState, useEffect, useMemo } from "react";

export interface NextSyncAtProps {
  lastSyncedAt: Date | null;
  syncInterval: number | null;
}

export function NextSyncAt(props: NextSyncAtProps) {
  const { lastSyncedAt: _lastSyncAt, syncInterval } = props;

  const lastSyncedAt = useMemo(() => {
    return _lastSyncAt ?? new Date();
  }, [_lastSyncAt]);

  const [secondsPassed, setSecondsPassed] = useState(0);

  useInterval(() => {
    setSecondsPassed((prev) => prev + 1);
  }, 1000);

  const syncEnabled = useGlobalStore((s) => s.syncEnabled);

  const timeTillNextSync = useMemo(() => {
    if (!lastSyncedAt || !syncInterval) return null;

    const syncIntervalInSeconds = syncInterval / 1000;
    return syncIntervalInSeconds - secondsPassed;
  }, [lastSyncedAt, syncInterval, secondsPassed]);

  useEffect(() => {
    setSecondsPassed(0);
  }, [lastSyncedAt, syncInterval, syncEnabled]);

  if (timeTillNextSync === null) return null;

  return (
    <>
      <span className="inline-flex min-w-[85px] items-center justify-center px-1 text-muted-foreground">
        Next in
        <span className="ml-1 min-w-[10px] font-semibold">
          {timeTillNextSync.toFixed(0)}s
        </span>
      </span>
    </>
  );
}
