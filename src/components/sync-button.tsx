"use client";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store";

export interface SyncButtonProps {}

export function SyncButton(props: SyncButtonProps) {
  const {} = props;

  const syncEnabled = useGlobalStore((state) => state.syncEnabled);
  const enableSync = useGlobalStore((state) => state.enableSync);
  const disableSync = useGlobalStore((state) => state.disableSync);

  return (
    <>
      <Button
        className="py-1"
        onClick={() => {
          if (syncEnabled) {
            disableSync();
          } else {
            enableSync();
          }
        }}
      >
        {syncEnabled ? "Stop " : "Start "}
        sync
      </Button>
      {/* </div> */}
    </>
  );
}
