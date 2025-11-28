import { queryOne } from "./client";
import type { ApiStatus } from "../routes/types";

// CREATE TABLE IF NOT EXISTS status (
//   id TEXT PRIMARY KEY DEFAULT 'status',
//   data JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT now()
// );

const STATUS_ID = "status";

const mapRow = (row: { id: string; data: ApiStatus }): ApiStatus => ({
  ...row.data,
});

export const statusRepository = {
  async get(): Promise<ApiStatus | null> {
    const row = await queryOne<{ id: string; data: ApiStatus }>(
      "SELECT id, data FROM status WHERE id = $1",
      [STATUS_ID]
    );
    return row ? mapRow(row) : null;
  },

  async upsert(payload: ApiStatus): Promise<ApiStatus> {
    await queryOne(
      `INSERT INTO status (id, data)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data,
           updated_at = now()
       RETURNING id`,
      [STATUS_ID, payload]
    );
    return payload;
  },
};
