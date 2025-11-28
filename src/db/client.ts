import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set. Postgres is required.");
  process.exit(1);
}

export const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
  max: 10,
});

export const query = async <T = unknown>(
  text: string,
  params: unknown[] = []
): Promise<T[]> => {
  const result = await pool.query<T>(text, params);
  return result.rows;
};

export const queryOne = async <T = unknown>(
  text: string,
  params: unknown[] = []
): Promise<T | null> => {
  const result = await pool.query<T>(text, params);
  return result.rows[0] ?? null;
};
