import { query, queryOne } from "./client";
import type { ApiProject } from "../routes/types";
import { randomUUID } from "crypto";

// Table schema:
// CREATE TABLE IF NOT EXISTS projects (
//   id TEXT PRIMARY KEY,
//   data JSONB NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT now(),
//   updated_at TIMESTAMPTZ DEFAULT now()
// );

const mapRow = (row: { id: string; data: ApiProject }): ApiProject => ({
  ...row.data,
  id: row.id,
});

export const projectsRepository = {
  async getAll(): Promise<ApiProject[]> {
    const rows = await query<{ id: string; data: ApiProject }>(
      "SELECT id, data FROM projects ORDER BY (data->>'year')::int DESC NULLS LAST"
    );
    return rows.map(mapRow);
  },

  async getById(id: string): Promise<ApiProject | null> {
    const row = await queryOne<{ id: string; data: ApiProject }>(
      "SELECT id, data FROM projects WHERE id = $1",
      [id]
    );
    return row ? mapRow(row) : null;
  },

  async create(payload: Omit<ApiProject, "id">): Promise<ApiProject> {
    const id = randomUUID();
    const data: ApiProject = { ...payload, id };
    await query(
      "INSERT INTO projects (id, data) VALUES ($1, $2::jsonb)",
      [id, data]
    );
    return data;
  },

  async update(id: string, updates: Partial<ApiProject>): Promise<ApiProject | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const merged: ApiProject = { ...existing, ...updates, id };
    await query(
      "UPDATE projects SET data = $2::jsonb, updated_at = now() WHERE id = $1",
      [id, merged]
    );
    return merged;
  },

  async delete(id: string): Promise<boolean> {
    const res = await queryOne<{ rowCount: number }>(
      "DELETE FROM projects WHERE id = $1 RETURNING 1 as rowCount",
      [id]
    );
    return Boolean(res);
  },
};
