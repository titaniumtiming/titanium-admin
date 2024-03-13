import { env } from "@/env";
import mssql from "mssql";
import { createPool } from "mysql2/promise";

// Define a type for the service context to ensure type safety.
export type ServiceContext = {
  mssqlRacetecDb: mssql.ConnectionPool;
  mysqlRemoteDb: ReturnType<typeof createPool>;
  bulkInsertIntoRemoteDb: <T>(
    options: BulkInsertOrUpdateOptions<T>,
  ) => Promise<unknown>;
};

// Declare variables to hold the singleton instances.
let mssqlRacetecDb: mssql.ConnectionPool | null = null;
let mysqlRemoteDb: ReturnType<typeof createPool> | null = null;

/**
 * Creates or returns an existing instance of the service context.
 * Ensures that only one instance of the localDb and remoteDb connections exist.
 * @returns A promise that resolves to an instance of the ServiceContext.
 */
export const createServiceContext = async (): Promise<ServiceContext> => {
  // Check if the localDb instance already exists, if not, create it.
  if (!mssqlRacetecDb) {
    mssqlRacetecDb = new mssql.ConnectionPool({
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
    await mssqlRacetecDb.connect();
  }

  // Check if the remoteDb instance already exists, if not, create it.
  if (!mysqlRemoteDb) {
    mysqlRemoteDb = createPool({
      uri: env.REMOTE_DATABASE_URL,
      namedPlaceholders: true,
    });
  }

  // Return the singleton instances.
  return {
    mssqlRacetecDb,
    mysqlRemoteDb,
    bulkInsertIntoRemoteDb: async (options: BulkInsertOrUpdateOptions<any>) => {
      return bulkInsertOrUpdate(options, async (sql, params) => {
        const [result] = await mysqlRemoteDb!.execute(sql, params);
        return result;
      });
    },
  };
};

type BulkInsertOrUpdateOptions<T> = {
  tableName: string;
  data: T[];
  updateOnDuplicate: boolean;
  logSql?: boolean;
  logParams?: boolean;
};

export async function bulkInsertOrUpdate<T extends Record<string, any>>(
  options: BulkInsertOrUpdateOptions<T>,
  executeQuery: (sql: string, params: Record<string, any>) => Promise<any>,
) {
  const { tableName, data, updateOnDuplicate } = options;

  if (data.length === 0) return; // Handle empty data case

  // Define the columns based on the keys of the first object in the array
  // @ts-expect-error
  const columns = Object.keys(data[0]);
  const placeholders = data
    .map(
      (_, index) =>
        `(${columns.map((column) => `:${column}${index}`).join(",")})`,
    )
    .join(",");

  const sqlBase = `
    INSERT INTO \`${tableName}\` (${columns.join(", ")})
    VALUES ${placeholders}
  `;

  const sqlUpdateOnDuplicate = updateOnDuplicate
    ? `
    ON DUPLICATE KEY UPDATE
    ${columns.map((column) => `${column} = VALUES(${column})`).join(", ")}
  `
    : "";

  const sql = sqlBase + sqlUpdateOnDuplicate;

  // Map the array of objects to a single object with unique keys for each placeholder
  const namedParameters = data.reduce((acc, currentItem, index) => {
    columns.forEach((column) => {
      // @ts-expect-error
      acc[`${column}${index}`] = currentItem[column];
    });
    return acc;
  }, {});

  options.logSql && console.log("sql: ", sql);
  options.logParams && console.log("params: ", namedParameters);

  // Execute the SQL query with the constructed SQL statement and parameters
  return executeQuery(sql, namedParameters);
}
