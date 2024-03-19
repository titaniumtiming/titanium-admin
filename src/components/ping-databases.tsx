"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";

export interface PingDatabasesProps {}

export function PingDatabases(props: PingDatabasesProps) {
  const {} = props;

  const pingLocalMutation = api.ping.pingRacetecDb.useMutation();
  const pingRemoteMutation = api.ping.pingRemoteDb.useMutation();

  return (
    <>
      <Button
        variant={"outline"}
        onClick={() => {
          console.log("Ping local: ");
          toast.promise(pingLocalMutation.mutateAsync(), {
            loading: "Pinging local database...",
            success: "Local database pinged",
            error: "Failed to ping local database",
          });
        }}
      >
        Ping local
      </Button>
      <Button
        variant={"outline"}
        onClick={() => {
          console.log("Ping remote: ");

          toast.promise(pingRemoteMutation.mutateAsync(), {
            loading: "Pinging remote database...",
            success: "Remote database pinged",
            error: "Failed to ping remote database",
          });
        }}
      >
        Ping remote
      </Button>
    </>
  );
}
