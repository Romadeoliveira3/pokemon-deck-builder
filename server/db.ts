import Database from 'better-sqlite3';
import path, { join } from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = join(__dirname, 'db/pokemon.db');
console.log('Utilizando banco de dados em:', dbPath);
const db = new Database(dbPath);

// Configuração inicial do banco
db.exec(`
  CREATE TABLE IF NOT EXISTS sets (
    id TEXT PRIMARY KEY,
    name TEXT,
    abbreviation TEXT,
    standard INTEGER,
    expanded INTEGER
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
