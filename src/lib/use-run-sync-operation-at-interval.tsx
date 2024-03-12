import { syncDbTableNameToInterval } from "@/config";
import { useInterval } from "@/lib/use-interval";
import { SyncDbTableName } from "@/schemas";
import { useGlobalStore } from "@/store";
import { useMemo, useState } from "react";

export type UseSyncOperationIntervalProps = {
  dbTableName: SyncDbTableName;
  runSyncOperation: () => Promise<unknown>;
};

export type SetSyncInterval = (interval: number | null) => void;
export function useRunSyncOperationAtInterval(
  props: UseSyncOperationIntervalProps,
) {
  const { runSyncOperation, dbTableName } = props;
  const defaultSyncInterval = useDefaultSyncInterval(dbTableName);
  const [syncInterval, setSyncInterval] = useState<number | null>(
    defaultSyncInterval,
  );

  const syncEnabled = useGlobalStore((state) => state.syncEnabled);
  const callback = syncEnabled
    ? runSyncOperation
    : () => {
        console.log(
          "Sync is disabled. Skipping sync operation for ",
          dbTableName,
        );
      };

  useInterval(callback, syncInterval);

  return {
    syncInterval,
    setSyncInterval,
  };
}

export function useDefaultSyncInterval(dbTableName: SyncDbTableName): number {
  return syncDbTableNameToInterval[dbTableName].default;
}

export function useSyncIntervalOptions(dbTableName: SyncDbTableName) {
  const defaultInterval = useDefaultSyncInterval(dbTableName);
  const slowInterval = syncDbTableNameToInterval[dbTableName].slow;

  return useMemo(() => {
    return [
      {
        value: defaultInterval.toString(),
        label: `Default (${defaultInterval / 1000}s)`,
      },
      {
        value: slowInterval.toString(),
        label: `Slow (${slowInterval / 1000}s)`,
      },
      {
        value: "manual",
        label: "Manual",
      },
      {
        value: "custom",
        label: "Custom",
      },
    ];
  }, [defaultInterval, slowInterval]);
}
