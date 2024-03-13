"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";

export interface PingDatabasesProps {}

export function PingDatabases(props: PingDatabasesProps) {
  const {} = props;

  const pingLocalMutation = api.ping.pingRacetecDb.useMutation({
    onError: (error) => {
      toast.error("Failed to ping local database");
      console.error(error);
    },
    onSuccess: (d) => {
      toast.success("Local database pinged");
      console.log(d);
    },
  });
  const pingRemoteMutation = api.ping.pingRemoteDb.useMutation({
    onError: (error) => {
      toast.error("Failed to ping remote database");
      console.error(error);
    },
    onSuccess: (d) => {
      toast.success("Remote database pinged");
      console.log(d);
    },
  });

  return (
    <>
      <Button
        variant={"outline"}
        onClick={() => {
          console.log("Ping local: ");
          pingLocalMutation.mutateAsync();
        }}
      >
        Ping local
      </Button>
      <Button
        variant={"outline"}
        onClick={() => {
          console.log("Ping remote: ");
          pingRemoteMutation.mutateAsync();
        }}
      >
        Ping remote
      </Button>
    </>
  );
}
