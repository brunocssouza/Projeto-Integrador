import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const updatedAt = new Date().toISOString();

    const [versionRows] = await pool.query<RowDataPacket[]>("SELECT VERSION() AS version");
    const dbVersion = versionRows[0]?.version || "";
    const dbVersionValue = dbVersion.split("-")[0];

    const [maxConnRows] = await pool.query<RowDataPacket[]>(
      "SHOW VARIABLES LIKE 'max_connections'"
    );
    const dbMaxConnectionsValue = maxConnRows[0]?.Value || 0;

    const [openedRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM information_schema.PROCESSLIST WHERE db = ?",
      [process.env.DATABASE_NAME || "mock_mentor"]
    );
    const dbOpenedConnectionsValue = openedRows[0]?.count || 0;

    return Response.json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: parseFloat(dbVersionValue),
          max_connections: Number(dbMaxConnectionsValue),
          opened_connections: Number(dbOpenedConnectionsValue),
        },
      },
    });
  } catch (error) {
    console.error("Status error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
