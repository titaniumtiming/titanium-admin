import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    REMOTE_DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL",
      ),
    // LOCAL_DATABASE_URL: z
    //   .string()
    //   .url()
    //   .refine(
    //     (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
    //     "You forgot to change the default URL",
    //   ),
    LOCAL_DB_NAME: z.string(),
    LOCAL_DB_USER: z.string(),
    LOCAL_DB_PASSWORD: z.string(),
    LOCAL_DB_PORT: z.string(),
    LOCAL_DB_HOST: z.string(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    REMOTE_DATABASE_URL: process.env.REMOTE_DATABASE_URL,
    // LOCAL_DATABASE_URL: process.env.LOCAL_DATABASE_URL,
    LOCAL_DB_NAME: process.env.LOCAL_DB_NAME,
    LOCAL_DB_USER: process.env.LOCAL_DB_USER,
    LOCAL_DB_PASSWORD: process.env.LOCAL_DB_PASSWORD,
    LOCAL_DB_PORT: process.env.LOCAL_DB_PORT,
    LOCAL_DB_HOST: process.env.LOCAL_DB_HOST,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
