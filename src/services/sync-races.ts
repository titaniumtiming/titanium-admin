import { service } from "@/lib/service";

export const syncRaces = service().query(async () => {
  return "hello" as const;
});
