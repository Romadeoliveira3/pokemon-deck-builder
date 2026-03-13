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
  const { name, lang = 'en', category, localId } = req.query;
  
  let query = 'SELECT cards.*, sets.abbreviation as setAbbreviation FROM cards LEFT JOIN sets ON cards.setId = sets.id WHERE cards.lang = ?';
  const params: any[] = [lang];

  if (name) {
    query += ' AND cards.name LIKE ?';
    params.push(`%${name}%`);
  }

  if (category) {
    query += ' AND cards.category = ?';
    params.push(category);
  }

  if (localId) {
    query += ' AND cards.localId = ?';
    params.push(localId);
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
