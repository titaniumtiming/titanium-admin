"use client";
import { api } from "@/lib/trpc/react";

export interface ServiceTestProps {}

export function ServiceTest(props: ServiceTestProps) {
  const {} = props;

  const { data } = api.syncRaces.useQuery();
  const { data: data2 } = api.syncEvents.useQuery();

  return (
    <>
      <div>
        service response:
        {JSON.stringify(data, null, 2)}
      </div>
    </>
  );
}
