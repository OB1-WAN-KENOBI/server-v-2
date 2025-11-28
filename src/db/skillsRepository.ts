import { query, queryOne } from "./client";
import type { ApiSkill } from "../routes/types";
import { randomUUID } from "crypto";

// CREATE TABLE IF NOT EXISTS skills (
//   id TEXT PRIMARY KEY,
//   data JSONB NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT now(),
//   updated_at TIMESTAMPTZ DEFAULT now()
// );

const mapRow = (row: { id: string; data: ApiSkill }): ApiSkill => ({
  id: row.id,
  ...row.data,
});

export const skillsRepository = {
  async getAll(): Promise<ApiSkill[]> {
    const rows = await query<{ id: string; data: ApiSkill }>(
      "SELECT id, data FROM skills ORDER BY data->>'name' ASC"
    );
    return rows.map(mapRow);
  },

  async getById(id: string): Promise<ApiSkill | null> {
    const row = await queryOne<{ id: string; data: ApiSkill }>(
      "SELECT id, data FROM skills WHERE id = $1",
      [id]
    );
    return row ? mapRow(row) : null;
  },

  async create(payload: Omit<ApiSkill, "id">): Promise<ApiSkill> {
    const id = randomUUID();
    const data: ApiSkill = { ...payload, id };
    await query(
      "INSERT INTO skills (id, data) VALUES ($1, $2::jsonb)",
      [id, data]
    );
    return data;
  },

  async update(id: string, updates: Partial<ApiSkill>): Promise<ApiSkill | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const merged: ApiSkill = { ...existing, ...updates, id };
    await query(
      "UPDATE skills SET data = $2::jsonb, updated_at = now() WHERE id = $1",
      [id, merged]
    );
    return merged;
  },

  async delete(id: string): Promise<boolean> {
    const res = await queryOne<{ rowCount: number }>(
      "DELETE FROM skills WHERE id = $1 RETURNING 1 as rowCount",
      [id]
    );
    return Boolean(res);
  },
};
