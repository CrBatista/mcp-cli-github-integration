import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

let db: Database.Database | null = null;

export const getDb = (): Database.Database => {
  if (!db) {
    const absolutePath = path.resolve(config.databaseFile);
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(absolutePath);
    db.pragma('journal_mode = WAL');
  }
  return db;
};

export const initDb = (): void => {
  const database = getDb();
  database
    .prepare(`
      CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, provider)
      )
    `)
    .run();
};
