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
          syncEnabled
            ? "bg-green-500 hover:bg-green-500"
            : "bg-red-500 hover:bg-red-500",
          "text-white",
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
