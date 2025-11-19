import { getDb } from './index';
import { Connection } from '../models/connection';

export interface ConnectionInput {
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
}

const mapRow = (row: any): Connection => row as Connection;

export const ConnectionRepository = {
  upsert(input: ConnectionInput): Connection {
    const db = getDb();
    const now = new Date().toISOString();
    const existing = this.findByUserAndProvider(input.userId, input.provider);

    if (existing) {
      db.prepare(
        `UPDATE connections
         SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = ?
         WHERE id = ?`
      ).run(
        input.accessToken,
        input.refreshToken ?? null,
        input.expiresAt ?? null,
        now,
        existing.id
      );
      return this.findById(existing.id)!;
    }

    const result = db
      .prepare(
        `INSERT INTO connections (user_id, provider, access_token, refresh_token, expires_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.userId,
        input.provider,
        input.accessToken,
        input.refreshToken ?? null,
        input.expiresAt ?? null,
        now,
        now
      );

    return this.findById(Number(result.lastInsertRowid))!;
  },

  findByUserAndProvider(userId: string, provider: string): Connection | null {
    const db = getDb();
    const row = db
      .prepare(`SELECT * FROM connections WHERE user_id = ? AND provider = ?`)
      .get(userId, provider);
    return row ? mapRow(row) : null;
  },

  findById(id: number): Connection | null {
    const db = getDb();
    const row = db.prepare(`SELECT * FROM connections WHERE id = ?`).get(id);
    return row ? mapRow(row) : null;
  },

  findAll(userId?: string): Connection[] {
    const db = getDb();
    if (userId) {
      return db
        .prepare(`SELECT * FROM connections WHERE user_id = ?`)
        .all(userId)
        .map(mapRow);
    }
    return db.prepare(`SELECT * FROM connections`).all().map(mapRow);
  }
};
