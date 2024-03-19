"use client";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/trpc/react";
import { useGlobalStore } from "@/store";
import React from "react";
import { toast } from "sonner";

export interface RunAllOnceButtonProps {}

export function RunAllOnceButton(props: RunAllOnceButtonProps) {
  const {} = props;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const syncEnabled = useGlobalStore((state) => state.syncEnabled);
  const disableSync = useGlobalStore((state) => state.disableSync);
  const [response, setResponse] = React.useState<any>(null);
  const runAllOnceMutation = api.syncAll.useMutation({
    onSuccess: (data) => {
      setResponse(data);
    },
    onError: (error) => {
      setResponse(error);
    },
  });

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (syncEnabled) {
            toast.info("Cannot run all once while sync is running", {
              action: {
                label: "Stop sync",
                onClick: () => {
                  disableSync();
                  // stop sync
                },
              },
            });
            return;
          }
          toast.promise(
            runAllOnceMutation.mutateAsync(),

            {
              duration: 3000,
              action: {
                label: "View Details",
                onClick: () => {
                  setDialogOpen(true);
                },
              },
              loading: "Running all once...",
              success: "All data has been synced",
              error: "Failed to sync all data",
            },
          );
        }}
      >
        run all once
      </Button>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
      >
        {/* <DialogTrigger>Open</DialogTrigger> */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync all details:</DialogTitle>
            {/* <DialogDescription> */}

            <pre>{JSON.stringify(response, null, 2)}</pre>
            {/* </DialogDescription> */}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
