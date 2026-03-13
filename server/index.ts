import express from 'express';
import db from './db';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Servir arquivos estáticos do frontend em produção
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // Rota curinga para SPA (React Router)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Endpoint de busca de cartas
app.get('/api/cards', (req, res) => {
  const name = req.query.name as string;
  const lang = (req.query.lang as string) || 'en';
  const category = req.query.category as string;
  const localId = req.query.localId as string;
  const setAbbreviation = req.query.setAbbreviation as string;
  const format = req.query.format as string;
  
  let query = 'SELECT cards.*, sets.abbreviation as setAbbreviation FROM cards LEFT JOIN sets ON cards.setId = sets.id WHERE cards.lang = ?';
  const params: any[] = [lang];

  if (name) {
    const normalizedName = name.replace(/\s+(ex|EX)$/i, '');
    query += ' AND (cards.name LIKE ? OR cards.name LIKE ? OR cards.name LIKE ?)';
    params.push(`%${name}%`, `%${normalizedName} ex%`, `%${normalizedName}-ex%`);
  }

  if (category) {
    query += ' AND cards.category = ?';
    params.push(category);
  }

  if (localId) {
    const paddedId = localId.padStart(3, '0');
    query += ' AND (cards.localId = ? OR cards.localId = ?)';
    params.push(localId, paddedId);
  }
  
  if (setAbbreviation) {
    query += ' AND (sets.abbreviation = ? OR sets.id = ?)';
    params.push(setAbbreviation, setAbbreviation.toLowerCase());
  }

  if (format === 'Standard') {
    query += " AND (sets.standard = 1 OR cards.setId LIKE 'sv%')";
  } else if (format === 'Expanded') {
    query += " AND (sets.expanded = 1 OR cards.setId LIKE 'sv%' OR cards.setId LIKE 'swsh%' OR cards.setId LIKE 'sm%' OR cards.setId LIKE 'xy%' OR cards.setId LIKE 'bw%')";
  }

  query += ' LIMIT 100';

  try {
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Endpoint de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
