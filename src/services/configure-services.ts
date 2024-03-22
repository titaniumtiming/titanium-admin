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
    deleteFromRemoteIfNotInRacetec: async <TItem>(
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

export type DeleteFromRemoteIfNotInRacetecOptions<TItem> = {
  compositeKey: (keyof TItem)[];
  tableName: string;
  itemsInRacetec: TItem[];
  mysqlRemoteDb: ReturnType<typeof createPool>;
};

const deleteFromRemoteIfNotInRacetec = async <TItem>(
  options: DeleteFromRemoteIfNotInRacetecOptions<TItem>,
) => {
  const { compositeKey, tableName, itemsInRacetec, mysqlRemoteDb } = options;

  // Get the composite key values from the items in Racetec
  const racetecCompositeKeys = itemsInRacetec.map((item) => {
    return compositeKey.reduce((acc, key) => {
      acc[key] = item[key];
      return acc;
    }, {} as Partial<TItem>);
  });

  // Construct the WHERE clause for the SELECT query
  const selectQueryWhereClause = racetecCompositeKeys
    .map((keys) => {
      return `(${compositeKey
        .map((key) => `${key as string} = '${keys[key]}'`)
        .join(" AND ")})`;
    })
    .join(" OR ");

  const selectQuery = `SELECT ${compositeKey.join(
    ", ",
  )} FROM \`${tableName}\` WHERE ${selectQueryWhereClause}`;
  const [selectedItems] = await mysqlRemoteDb.execute(selectQuery);

  // Find the items in the remote database that are not in Racetec
  const itemsToDelete = (selectedItems as TItem[]).filter((remoteItem) => {
    return !racetecCompositeKeys.some((racetecKeys) => {
      return compositeKey.every((key) => remoteItem[key] === racetecKeys[key]);
    });
  });

  if (itemsToDelete.length > 0) {
    // Construct the WHERE clause for the DELETE query
    const deleteQueryWhereClause = itemsToDelete
      .map((item) => {
        return `(${compositeKey
          .map((key) => `${key as string} = '${item[key]}'`)
          .join(" AND ")})`;
      })
      .join(" OR ");

    const deleteQuery = `DELETE FROM \`${tableName}\` WHERE ${deleteQueryWhereClause}`;
    await mysqlRemoteDb.execute(deleteQuery);
  }
};
