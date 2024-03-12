import { env } from "@/env";
import { Pool } from "mysql2";
import { createPool } from "mysql2/promise";
import mssql from "mssql";
export type ServiceContext = {
  localDb: mssql.ConnectionPool;
  remoteDb: ReturnType<typeof createPool>;
};

export const createServiceContext = async (): Promise<ServiceContext> => {
  // // const localDb = createPool(env.LOCAL_DATABASE_URL);
  // const localDb = createPool({
  //   host: env.LOCAL_DB_HOST,
  //   password: env.LOCAL_DB_PASSWORD,
  //   database: env.LOCAL_DB_NAME,
  //   // user: env.LOCAL_DB_USER,
  //   port: Number(env.LOCAL_DB_PORT),
  //   waitForConnections: true,
  //   connectionLimit: 10,
  //   queueLimit: 0,
  // });

  // Create a connection pool for the local Microsoft SQL Server database
  const localDb = new mssql.ConnectionPool({
    user: env.LOCAL_DB_USER,
    password: env.LOCAL_DB_PASSWORD,
    server: env.LOCAL_DB_HOST, // You can use 'localhost\\instance' to connect to named instance
    database: env.LOCAL_DB_NAME,
    port: Number(env.LOCAL_DB_PORT),
    options: {
      // encrypt: true, // Use this if you're on Windows Azure
      trustServerCertificate: true, // Change to true for local dev / self-signed certs
    },
  });

  await localDb.connect();
  const remoteDb = createPool({
    uri: env.REMOTE_DATABASE_URL,
    namedPlaceholders: true,
  });

  return {
    localDb,
    remoteDb,
  };
};
