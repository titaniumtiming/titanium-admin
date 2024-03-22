import { MAX_DELETE_COUNT } from "@/config";
import { env } from "@/env";
import mssql from "mssql";
import { createPool, escape } from "mysql2/promise";

// Define a type for the service context to ensure type safety.
export type ServiceContext = {
  mssqlRacetecDb: mssql.ConnectionPool;
  mysqlRemoteDb: ReturnType<typeof createPool>;
  bulkInsertIntoRemoteDb: <T>(
    options: BulkInsertOrUpdateOptions<T>,
  ) => Promise<unknown>;
  deleteFromRemoteIfNotInRacetec: <TItem>(
    options: Omit<
      // @ts-expect-error
      DeleteFromRemoteIfNotInRacetecOptions<TItem>,
      "mysqlRemoteDb"
    >,
  ) => Promise<void>;
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
    try {
      mysqlRemoteDb = createPool({
        host: env.REMOTE_DB_HOST,
        user: env.REMOTE_DB_USER,
        password: env.REMOTE_DB_PASSWORD,
        database: env.REMOTE_DB_NAME,
        port: Number(env.REMOTE_DB_PORT),
        namedPlaceholders: true,
        // debug: true,
      })!;
    } catch (error) {
      throw new Error("my sql connection error: " + error);
    }
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
    // @ts-expect-error
    deleteFromRemoteIfNotInRacetec: async <TItem extends { RaceId: string }>(
      options: Omit<
        DeleteFromRemoteIfNotInRacetecOptions<TItem>,
        "mysqlRemoteDb"
      >,
    ) => {
      Object.assign(options, { mysqlRemoteDb });
      return deleteFromRemoteIfNotInRacetec({
        ...options,
        mysqlRemoteDb: mysqlRemoteDb!,
      });
    },
  };
};

/**
 * !NOTE: THESE FUNCTIONS SHOULD NOT BE USED OUTSIDE OF INTERNAL ADMIN TOOL CONTEXT.
 * (both bulkInsertOrUpdate and deleteFromRemoteIfNotInRacetec)
 *
 * We are using direct string interpolation to construct SQL queries, which is unsafe and can lead to SQL injection attacks.
 *
 * This is fine as the tool only runs locally and is not exposed to the any untrusted users.
 *
 * But if you are building a public facing API, you should use parameterized queries to prevent SQL injection attacks.
 */

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

  // Split the data into chunks
  // Otherwise the athlete results query can be too large (causes error 1390: Prepared statement contains too many placeholders)
  const chunkSize = 50000;
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  // Process each chunk
  for (const chunk of chunks) {
    const values = chunk
      .map(
        (row) => `(${columns.map((column) => escape(row[column])).join(",")})`,
      )
      .join(",");

    const sqlBase = `
      INSERT INTO \`${tableName}\` (${columns.join(", ")})
      VALUES ${values}
    `;

    const sqlUpdateOnDuplicate = updateOnDuplicate
      ? `
      ON DUPLICATE KEY UPDATE
      ${columns.map((column) => `${column} = VALUES(${column})`).join(", ")}
    `
      : "";

    const sql = sqlBase + sqlUpdateOnDuplicate;

    options.logSql && console.log("sql: ", sql);

    // Execute the SQL query for the current chunk
    await executeQuery(sql, {});
  }
}

export type DeleteFromRemoteIfNotInRacetecOptions<
  TItem extends { RaceId: string },
> = {
  compositeKey: (keyof TItem)[];
  tableName: string;
  itemsInRacetec: TItem[];
  mysqlRemoteDb: ReturnType<typeof createPool>;
};

const deleteFromRemoteIfNotInRacetec = async <TItem extends { RaceId: string }>(
  options: DeleteFromRemoteIfNotInRacetecOptions<TItem>,
) => {
  const { compositeKey, tableName, itemsInRacetec, mysqlRemoteDb } = options;

  if (itemsInRacetec.length === 0) {
    // console.log(`No items in Racetec. Skipping deletion. Table: ${tableName} `);
    return;
  }

  if ((MAX_DELETE_COUNT as number) === 0) {
    // console.warn("MAX_DELETE_COUNT is set to 0. Skipping deletion.");
    return;
  }

  const raceId = itemsInRacetec[0]?.RaceId;

  // Construct the subquery to find the composite key values in Racetec
  const racetecCompositeKeysSubquery = itemsInRacetec
    .map((item) => {
      return `(${compositeKey.map((key) => `'${item[key]}'`).join(", ")})`;
    })
    .join(", ");

  // Construct the DELETE query with a subquery to find the items not in Racetec
  const deleteQuery = `
    DELETE FROM \`${tableName}\`
    WHERE RaceId = ${raceId}
    AND (${compositeKey.join(", ")}) NOT IN (
      ${racetecCompositeKeysSubquery}
    )
    LIMIT ${MAX_DELETE_COUNT}
  `;

  const [result] = await mysqlRemoteDb.execute(deleteQuery);
  const deletedCount = (result as any).affectedRows;

  console.log(`Deleted ${deletedCount} items from ${tableName}`);

  if (deletedCount === MAX_DELETE_COUNT) {
    console.warn(
      `Maximum delete count of ${MAX_DELETE_COUNT} reached. Some items may not have been deleted.`,
    );
  }
};
