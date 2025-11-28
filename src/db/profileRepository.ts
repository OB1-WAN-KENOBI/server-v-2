import { queryOne } from "./client";
import type { ApiProfile } from "../routes/types";

// CREATE TABLE IF NOT EXISTS profile (
//   id TEXT PRIMARY KEY DEFAULT 'profile',
//   data JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT now()
// );

const PROFILE_ID = "profile";

const mapRow = (row: { id: string; data: ApiProfile }): ApiProfile => ({
  ...row.data,
});

export const profileRepository = {
  async get(): Promise<ApiProfile | null> {
    const row = await queryOne<{ id: string; data: ApiProfile }>(
      "SELECT id, data FROM profile WHERE id = $1",
      [PROFILE_ID]
    );
    return row ? mapRow(row) : null;
  },

  async upsert(payload: ApiProfile): Promise<ApiProfile> {
    await queryOne(
      `INSERT INTO profile (id, data)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data,
           updated_at = now()
       RETURNING id`,
      [PROFILE_ID, payload]
    );
    return payload;
  },
};
