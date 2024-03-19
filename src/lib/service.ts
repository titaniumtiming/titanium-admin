import {
  z,
  infer as zInfer,
  ZodObject,
  ZodRawShape,
  ZodSchema,
  ZodTypeAny,
} from "zod";

import { Simplify } from "@/lib/utils";
import { ApiContext } from "@/lib/trpc/trpc";
import { ServiceContext } from "@/services/configure-services";
/**
 * "Access" related code has been commented out.
 * This handles authenticated vs public access.
 * Chose to not delete it in case it's needed later.
 */

// Generic type for resolver functions
export type Resolver<
  TInputSchema extends ZodTypeAny | undefined,
  TOutputSchema extends ZodTypeAny | undefined | unknown,
> = (opts: {
  input: TInputSchema extends ZodTypeAny ? zInfer<TInputSchema> : null;
  ctx: ServiceContext;
}) => Promise<TOutputSchema extends ZodTypeAny ? zInfer<TOutputSchema> : void>;

// Define the builder interface capturing generic types for input and output

type ZodSchemaOrRawShape = ZodSchema<any> | ZodRawShape;
type InferZodSchemaOrRawShape<T extends ZodSchemaOrRawShape> =
  T extends ZodRawShape ? ZodObject<T> : T;

export interface ServiceBuilder<
  TInputSchema extends ZodTypeAny | undefined,
  TOutputSchema extends ZodTypeAny | undefined,
  TType extends "mutation" | "query" | undefined,
  TAccess extends "public" | "authed" | undefined = "authed",
> {
  // allows for objects to be passed in without having to call z.object
  input: <TNewInputSchema extends ZodSchemaOrRawShape>(
    schema: TNewInputSchema,
  ) => ServiceBuilder<
    InferZodSchemaOrRawShape<TNewInputSchema>, // handle zod object or raw shape
    TOutputSchema,
    TType,
    TAccess
  >;
  output: <TNewOutput extends ZodTypeAny>(
    schema: TNewOutput,
  ) => ServiceBuilder<TInputSchema, TNewOutput, TType, TAccess>;
  access: <TNewAccess extends "public" | "authed">(
    access: TNewAccess,
  ) => ServiceBuilder<TInputSchema, TOutputSchema, TType, TNewAccess>;
  mutation: <TResolver extends Resolver<TInputSchema, TOutputSchema>>(
    resolver: TResolver,
  ) => Service<TResolver, TInputSchema, TOutputSchema, "mutation", TAccess>;
  query: <TResolver extends Resolver<TInputSchema, TOutputSchema>>(
    resolver: TResolver,
  ) => Service<TResolver, TInputSchema, TOutputSchema, "query", TAccess>;
}

export type Service<
  TResolver extends Resolver<any, any>,
  TInputSchema extends ZodTypeAny | undefined,
  TOutputSchema extends ZodTypeAny | undefined | unknown,
  TType extends "mutation" | "query" | undefined,
  TAccess extends "public" | "authed" | undefined = "authed",
> = ServiceDef<TResolver, TInputSchema, TOutputSchema, TType, TAccess> & {
  (
    ctx: ServiceContext,
    input: TInputSchema extends ZodTypeAny ? zInfer<TInputSchema> : void,
  ): ReturnType<TResolver>;
};

export type ServiceDef<
  TResolver extends Resolver<any, any>,
  TInputSchema extends ZodTypeAny | undefined,
  TOutputSchema extends ZodTypeAny | undefined | unknown,
  TType extends "mutation" | "query" | undefined,
  TAccess extends "public" | "authed" | undefined,
> = {
  inputSchema: TInputSchema;
  outputSchema: TOutputSchema;
  resolver: TResolver;
  type: TType;
  accessLevel: TAccess;
};

const initlaDef = {
  inputSchema: undefined,
  outputSchema: undefined,
  resolver: undefined,
  type: undefined,
  accessLevel: "public" as const,
};

export function service() {
  const def: ServiceDef<any, any, any, any, any> = { ...initlaDef };

  const builder: ServiceBuilder<undefined, any, any> = {
    access: function <TNewAccess extends "public" | "authed">(
      access: TNewAccess,
    ) {
      def.accessLevel = access;
      return this as unknown as ServiceBuilder<undefined, any, any, TNewAccess>;
    },
    // allows for objects to be passed in without having to call z.object
    input: function <TNewInputSchema extends ZodSchemaOrRawShape>(
      schema: TNewInputSchema,
    ) {
      if (schema instanceof ZodSchema) {
        def.inputSchema = schema;
      } else {
        def.inputSchema = z.object(schema);
      }

      return this as unknown as ServiceBuilder<
        InferZodSchemaOrRawShape<TNewInputSchema>, // handle zod object or raw shape
        undefined,
        any
      >;
    },
    output: function <TNewOutput extends ZodTypeAny>(schema: TNewOutput) {
      def.outputSchema = schema;
      return this as unknown as ServiceBuilder<undefined, TNewOutput, any>;
    },
    mutation: function <TResolver extends Resolver<any, any>>(
      resolver: TResolver,
    ) {
      const newDef = {
        ...def,
        resolver,
        type: "mutation",
      } as ServiceDef<any, any, any, "mutation", any>;
      // console.log("MUTATION: ", newDef);
      return createResolver(newDef) as unknown as Service<
        TResolver,
        any,
        any,
        "mutation"
      >;
    },
    query: function <TResolver extends Resolver<any, any>>(
      resolver: TResolver,
    ) {
      const newDef = {
        ...def,
        resolver,
        type: "query",
      } as ServiceDef<TResolver, any, any, "query", any>;

      // console.log("QUERY: ", newDef);
      return createResolver(newDef) as unknown as Service<
        TResolver,
        undefined,
        any,
        "query"
      >;
    },
  };

  return builder;
}

export function createResolver<
  TResolver extends Resolver<any, any>,
  TInputSchema extends ZodTypeAny | undefined,
  TOutputSchema extends ZodTypeAny | undefined,
  TType extends "mutation" | "query",
  TAccess extends "public" | "authed" | undefined,
>(def: ServiceDef<TResolver, TInputSchema, TOutputSchema, TType, TAccess>) {
  /**
   *  Calls the resolver function without parsing input/output
   *  Useful for calling the resolver when the input/output is already parsed
   */
  const callerWithoutParser = async (
    ctx: ServiceContext,
    input: TInputSchema extends ZodTypeAny ? zInfer<TInputSchema> : null,
  ) => {
    if (!def.resolver) {
      throw new Error("Resolver not defined");
    }
    return def.resolver({ input, ctx });
  };

  /**
   * invokes the resolver without parsing input/output
   * Useful for safe calling the resolver directly
   */
  const callerWithParser = async (ctx: ServiceContext, input: any) => {
    // const isOnlyAuthed = def.accessLevel === "authed";
    // if (isOnlyAuthed) {
    //   const hasId =
    //     ctx.user?.id !== undefined &&
    //     ctx.user.id !== null &&
    //     ctx.user.id !== "";
    //   if (!hasId) throw new Error("User is not logged in");
    // }

    const maybeParsedInput = def.inputSchema
      ? def.inputSchema.parse(input)
      : input;
    const result = await callerWithoutParser(ctx, maybeParsedInput);
    const maybeParsedOutput = def.outputSchema
      ? def.outputSchema.parse(result)
      : result;

    return maybeParsedOutput;
  };

  return Object.assign(callerWithParser, def);
}
