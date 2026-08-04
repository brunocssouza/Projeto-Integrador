import mysql from "mysql2/promise";

// Per-instance pool size. With N app instances behind a load balancer,
// total DB connections ≈ N × DB_CONNECTION_LIMIT — keep below MySQL max_connections.
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT) || 10;

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "root",
  database: process.env.DATABASE_NAME || "mock_mentor",
  waitForConnections: true,
  connectionLimit,
  queueLimit: 0,
  // Graceful behaviour under load: don't hold idle connections forever.
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export default pool;
