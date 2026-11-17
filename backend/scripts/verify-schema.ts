import "dotenv/config";
import pool from "../src/config/mysql.js";

async function verify() {
  const newTables = [
    "users",
    "movies",
    "movie_genres",
    "movie_cast",
    "events",
    "event_ticket_tiers",
  ];

  console.log("--- TABLE STRUCTURE VERIFICATION ---");
  for (const table of newTables) {
    const [cols] = await pool.query(`DESCRIBE \`${table}\``);
    console.log(`\nTable ${table} columns:`);
    console.table(cols);

    const [createRes] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
    const createSql = (createRes as any)[0]["Create Table"];
    console.log(`Foreign keys & indices in ${table}:`);
    const constraints = createSql
      .split("\n")
      .filter((line: string) => line.includes("CONSTRAINT") || line.includes("KEY"));
    console.log(constraints.join("\n"));
  }

  await pool.end();
}

verify().catch(console.error);
