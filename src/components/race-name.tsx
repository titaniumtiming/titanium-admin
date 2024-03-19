"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/react";
import { Pencil1Icon } from "@radix-ui/react-icons";

export interface RaceNameProps {}

export function RaceName(props: RaceNameProps) {
  const {} = props;

  const {
    data: defaultRaceDetails,
    isLoading,
    isError,
    isSuccess,
  } = api.getDefaultRaceDetails.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>
        <h1 className="px-2 text-3xl font-bold text-red-500">
          ERROR: YOU MUST SELECT A DEFAULT RACE IN RACETEC
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className=" text-muted-foreground">
        {defaultRaceDetails?.RaceDate}
      </div>
      <div className="flex gap-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {defaultRaceDetails?.RaceName}({defaultRaceDetails?.RaceId})
        </h2>
        <Button variant="ghost" size="icon">
          <Pencil1Icon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
