import express from 'express';
import db from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

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
