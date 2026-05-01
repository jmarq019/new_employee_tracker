import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _pool: mysql.Pool | undefined;
}

const pool =
  global._pool ??
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'team_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  });

if (process.env.NODE_ENV !== 'production') {
  global._pool = pool;
}

export default pool;
