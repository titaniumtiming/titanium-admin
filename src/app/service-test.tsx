"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/react";

export interface ServiceTestProps {}

export function ServiceTest(props: ServiceTestProps) {
  const {} = props;

  const syncRacesMutatation = api.syncRaces.useMutation();
  // const { data: data2 } = api.syncEvents.useQuery();

  return (
    <>
      <div>
        <Button
          onClick={() => {
            syncRacesMutatation.mutateAsync().then((data) => {
              console.log(data);
            });
          }}
        >
          run sync races
        </Button>
        {/* service response:
        {JSON.stringify(data, null, 2)} */}
      </div>
    </>
  );
}
