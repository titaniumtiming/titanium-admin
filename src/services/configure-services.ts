import { env } from "@/env";
import mssql from "mssql";
import { createPool } from "mysql2/promise";

// Define a type for the service context to ensure type safety.
export type ServiceContext = {
  localDb: mssql.ConnectionPool;
  remoteDb: ReturnType<typeof createPool>;
};

// Declare variables to hold the singleton instances.
let localDbInstance: mssql.ConnectionPool | null = null;
let remoteDbInstance: ReturnType<typeof createPool> | null = null;

/**
 * Creates or returns an existing instance of the service context.
 * Ensures that only one instance of the localDb and remoteDb connections exist.
 * @returns A promise that resolves to an instance of the ServiceContext.
 */
export const createServiceContext = async (): Promise<ServiceContext> => {
  // Check if the localDb instance already exists, if not, create it.
  if (!localDbInstance) {
    localDbInstance = new mssql.ConnectionPool({
      user: env.LOCAL_DB_USER,
      password: env.LOCAL_DB_PASSWORD,
      server: env.LOCAL_DB_HOST,
      database: env.LOCAL_DB_NAME,
      port: Number(env.LOCAL_DB_PORT),
      options: {
        trustServerCertificate: true,
      },
    });

    // Connect the localDb instance.
    await localDbInstance.connect();
  }

  // Check if the remoteDb instance already exists, if not, create it.
  if (!remoteDbInstance) {
    remoteDbInstance = createPool({
      uri: env.REMOTE_DATABASE_URL,
      namedPlaceholders: true,
    });
  }

  // Return the singleton instances.
  return {
    localDb: localDbInstance,
    remoteDb: remoteDbInstance,
  };
};
