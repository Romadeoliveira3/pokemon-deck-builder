import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'server/db/pokemon.db');
const db = new Database(dbPath);

// Configuração inicial do banco
db.exec(`
  CREATE TABLE IF NOT EXISTS sets (
    id TEXT PRIMARY KEY,
    name TEXT,
    abbreviation TEXT
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT,
    localId TEXT,
    name TEXT,
    image TEXT,
    category TEXT,
    setId TEXT,
    lang TEXT,
    PRIMARY KEY(id, lang),
    FOREIGN KEY(setId) REFERENCES sets(id)
  );

  CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
  CREATE INDEX IF NOT EXISTS idx_cards_lang ON cards(lang);
  CREATE INDEX IF NOT EXISTS idx_cards_localId ON cards(localId);
`);

export default db;
