import { z, infer as zInfer, ZodTypeAny } from "zod";


import { Resolver, Service } from "./service";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/trpc";

import {
  MutationProcedure,
  QueryProcedure,
} from "@trpc/server/unstable-core-do-not-import";
export function createTRPCProcedure<
  TResolver extends Resolver<any, any>,
  TInputSchema extends ZodTypeAny | undefined,
  TOutputSchema extends ZodTypeAny | undefined,
  TType extends "mutation" | "query",
  TAccess extends "public" | "authed" | undefined,
>(service: Service<TResolver, TInputSchema, TOutputSchema, TType, TAccess>) {
  if (!service.resolver) {
    throw new Error("Resolver not defined");
  }

  type InputOutput = {
    input: TInputSchema extends ZodTypeAny ? zInfer<TInputSchema> : void;
    output: ReturnType<TResolver> extends Promise<infer TOutput>
      ? TOutput
      : never;
  };

  type ProcedureResult = TType extends "mutation"
    ? MutationProcedure<InputOutput>
    : QueryProcedure<InputOutput>;

  const inputSchema = service.inputSchema ?? z.void();

  const procedure = publicProcedure;
  // const procedure =
  //   service.accessLevel === "public" ? publicProcedure : authedProcedure;

  if (service.type === "mutation")
    return procedure
      .input(inputSchema)
      .mutation(service.resolver as any) as unknown as ProcedureResult;

  if (service.type === "query")
    return procedure
      .input(inputSchema)
      .query(service.resolver as any) as unknown as ProcedureResult;

  throw new Error("Type not defined");
}

export function createServiceProcedures<
  TServiceMap extends Record<string, Service<any, any, any, any, any>>,
>(serviceMap: TServiceMap) {
  type ServiceKeys = keyof TServiceMap;
  type Procedures = {
    [K in ServiceKeys]: ReturnType<
      typeof createTRPCProcedure<
        TServiceMap[K]["resolver"],
        TServiceMap[K]["inputSchema"],
        TServiceMap[K]["outputSchema"],
        TServiceMap[K]["type"],
        "public"
        // TServiceMap[K]["accessLevel"]
      >
    >;
  };

  const procedures = Object.entries(serviceMap).reduce(
    (acc, [key, service]) => {
      acc[key as ServiceKeys] = createTRPCProcedure(
        service,
      ) as Procedures[ServiceKeys];
      return acc;
    },
    {} as Procedures,
  );

  return procedures;
}

export function createServiceRouter<
  TServiceMap extends Record<string, Service<any, any, any, any, any>>,
>(serviceMap: TServiceMap) {
  const procedures = createServiceProcedures(serviceMap);
  return createTRPCRouter(procedures);
}
