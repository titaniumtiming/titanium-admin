import { service } from "@/lib/service";

export const syncEvents = service().query(async ({ ctx }) => {
  const result = await ctx.remoteDb.query("select * from `dbo.Race`");
  return result as any;
  return "hello" as const;
});
