/**
 * Applies database/schema.sql to the MySQL database.
 * Uses the mysql2 pool from infra/database.ts (reads .env.local).
 *
 * Usage: npm run db:schema
 * Uses .env.local for DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME
 */
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

async function main() {
  const host = process.env.DATABASE_HOST || "localhost";
  const port = Number(process.env.DATABASE_PORT) || 3306;
  const user = process.env.DATABASE_USER || "root";
  const password = process.env.DATABASE_PASSWORD || "";
  const database = process.env.DATABASE_NAME || "mock_mentor";

  console.log(`Connecting to MySQL at ${host}:${port}...`);

  // Connect without database to create it if needed
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${database}\``);

  // Drop all tables if --force flag is passed
  const force = process.argv.includes("--force");
  if (force) {
    console.log("Dropping all existing tables...");
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    const [tables] = await conn.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?",
      [database]
    );
    for (const row of tables as { TABLE_NAME: string }[]) {
      await conn.query(`DROP TABLE IF EXISTS \`${row.TABLE_NAME}\``);
    }
    // Also drop Prisma migrations table
    await conn.query("DROP TABLE IF EXISTS `_prisma_migrations`");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  }

  const schemaPath = path.resolve(__dirname, "../database/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  console.log(`Applying schema from ${schemaPath}...`);
  await conn.query(sql);

  console.log("Schema applied successfully!");
  await conn.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Schema application failed:", err.message);
  process.exit(1);
});
