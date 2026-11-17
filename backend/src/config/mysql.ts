import fs from "node:fs";
import path from "node:path";
import mysql, { type Pool, type PoolOptions } from "mysql2/promise";
import { env } from "./env.js";

function getSslConfig(): PoolOptions["ssl"] {
  // If CA cert file path is provided and exists, use it
  if (process.env.DB_SSL_CA) {
    const certPath = path.resolve(process.cwd(), process.env.DB_SSL_CA);
    if (fs.existsSync(certPath)) {
      return {
        ca: fs.readFileSync(certPath, "utf-8"),
        rejectUnauthorized: true,
      };
    }
  }

  // Check for common cert location in certs/ca.pem
  const defaultCertPath = path.resolve(process.cwd(), "certs", "ca.pem");
  if (fs.existsSync(defaultCertPath)) {
    return {
      ca: fs.readFileSync(defaultCertPath, "utf-8"),
      rejectUnauthorized: true,
    };
  }

  // Aiven requires SSL connection. When CA cert file is not locally present,
  // rejectUnauthorized: false enables secure TLS transport while accepting the cloud cert.
  return {
    rejectUnauthorized: false,
  };
}

export const dbConfig: PoolOptions = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: getSslConfig(),
};

export const pool: Pool = mysql.createPool(dbConfig);

export async function testDatabaseConnection(): Promise<{ database: string }> {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
    const [rows] = await connection.query("SELECT DATABASE() AS currentDb");
    const dbName = (rows as Array<{ currentDb: string }>)[0]?.currentDb || env.DB_NAME;
    return { database: dbName };
  } finally {
    connection.release();
  }
}

export default pool;
