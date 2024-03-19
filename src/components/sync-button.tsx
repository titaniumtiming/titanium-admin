"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
        className={cn(
          "py-1",
          "text-white",
          syncEnabled && "bg-green-700 hover:bg-green-600",
        )}
        onClick={() => {
          if (syncEnabled) {
            disableSync();
          } else {
            enableSync();
          }
        }}
      >
        {syncEnabled
          ? "Running (press to stop) "
          : "Not running (press to start) "}
      </Button>
      {/* </div> */}
    </>
  );
}
