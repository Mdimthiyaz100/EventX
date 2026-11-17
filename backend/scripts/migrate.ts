import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../src/config/mysql.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const sqlPath = path.resolve(__dirname, "..", "migrations", "001_create_modules_schema.sql");
  console.log("Reading SQL from:", sqlPath);
  const sql = fs.readFileSync(sqlPath, "utf-8");
  console.log("SQL file length:", sql.length);

  const rawStatements = sql.split(";");
  const statements: string[] = [];
  for (const raw of rawStatements) {
    // Strip comment lines
    const cleaned = raw
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim();
    if (cleaned.length > 0) {
      statements.push(cleaned);
    }
  }

  console.log(`Executing migration: ${statements.length} statements found...`);

  const connection = await pool.getConnection();
  try {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await connection.query(stmt);
      }
    }
    console.log("Migration executed successfully!");
  } catch (err: any) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigration();
