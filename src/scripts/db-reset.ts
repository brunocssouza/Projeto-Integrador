import { readFileSync } from "fs";
import { join } from "path";
import { Pool, RowDataPacket, createPool } from "mysql2/promise";
import { seedData } from "./seed";

async function getPool(): Promise<Pool> {
  return createPool({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "root",
    database: process.env.DATABASE_NAME || "mock_mentor",
  });
}

async function reset() {
  const pool = await getPool();
  console.log("Removendo todas as tabelas...");

  try {
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");

    const [tables] = await pool.query<RowDataPacket[]>(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DATABASE_NAME || "mock_mentor"]
    );

    for (const table of tables) {
      const name = table.TABLE_NAME;
      await pool.query(`DROP TABLE IF EXISTS \`${name}\``);
      console.log(`  Removida: ${name}`);
    }

    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Recriando esquema a partir de infra/migrations/schema.sql...");
    const schemaPath = join(__dirname, "..", "infra", "migrations", "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    const lines = schema.split("\n");
    const cleanedLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("--")) continue;
      cleanedLines.push(line);
    }

    const cleaned = cleanedLines.join("\n");

    const statements = cleaned
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s !== "\n" && !s.startsWith("\n"));

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (e: any) {
        console.error(`Erro ao executar: ${stmt.slice(0, 120)}...`);
        throw e;
      }
    }

    console.log("Banco resetado! Populando dados...");
    await seedData(pool);
  } catch (error) {
    console.error("Erro ao resetar banco:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

reset();
