import { SyncDbTableName } from "@/components/admin-table/rows";
import {
  IntervalConfig,
  defaultIntervalConfig,
} from "@/components/interval-select";
import { syncDbTableNameToInterval } from "@/config";
import { useInterval } from "@/lib/use-interval";
import { useMemo, useState } from "react";

export type UseSyncOperationIntervalProps = {
  dbTableName: SyncDbTableName;
  runSyncOperation: () => Promise<unknown>;
};
export function useSyncOperationInterval(props: UseSyncOperationIntervalProps) {
  const { runSyncOperation } = props;
  const [intervalConfig, setIntervalConfig] = useState<IntervalConfig>(
    defaultIntervalConfig,
  );

  const intervalTimeInMs = useMemo(() => {
    if (intervalConfig.interval === "manual") return null;
    if (intervalConfig.interval === "custom") {
      if (!intervalConfig.customInterval) return null;
      return parseInt(intervalConfig.customInterval, 10);
    }

    if (intervalConfig.interval === "default")
      return syncDbTableNameToInterval[props.dbTableName].default;
    if (intervalConfig.interval === "slow")
      return syncDbTableNameToInterval[props.dbTableName].slow;

    throw new Error("Invalid interval type");
  }, [
    intervalConfig.customInterval,
    intervalConfig.interval,
    props.dbTableName,
  ]);

  useInterval(runSyncOperation, intervalTimeInMs);

  return {
    intervalConfig,
    setIntervalConfig,
  };
}
