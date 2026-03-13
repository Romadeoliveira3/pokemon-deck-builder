import db from './db';

const LANGUAGES = ['en', 'pt', 'es'];
const BASE_URL = 'https://api.tcgdex.net/v2';

async function sync() {
  console.log('Iniciando sincronização com TCGdex...');

  for (const lang of LANGUAGES) {
    console.log(`Baixando dados para o idioma: ${lang}...`);

    // 1. Sincronizar Sets (Coleções)
    const setsResponse = await fetch(`${BASE_URL}/${lang}/sets`);
    const sets = await setsResponse.json() as any[];

    const insertSet = db.prepare('INSERT OR REPLACE INTO sets (id, name, abbreviation) VALUES (?, ?, ?)');
    
    const setTransaction = db.transaction((setsList) => {
      for (const set of setsList) {
        insertSet.run(set.id, set.name, set.abbreviation?.official || set.id.toUpperCase());
      }
    });

    setTransaction(sets);
    console.log(`- ${sets.length} coleções sincronizadas.`);

    // 2. Sincronizar Cards
    const cardsResponse = await fetch(`${BASE_URL}/${lang}/cards`);
    const cards = await cardsResponse.json() as any[];

    const insertCard = db.prepare(`
      INSERT OR REPLACE INTO cards (id, localId, name, image, category, setId, lang)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const cardTransaction = db.transaction((cardsList) => {
      for (const card of cardsList) {
        if (!card.image) continue; // Ignorar cartas sem imagem
        const setId = card.id.substring(0, card.id.lastIndexOf('-'));
        insertCard.run(
          card.id,
          card.localId,
          card.name,
          `${card.image}/low.png`,
          card.category || null,
          setId || null,
          lang
        );
      }
    });

    cardTransaction(cards);
    console.log(`- ${cards.length} cartas sincronizadas.`);
  }

  console.log('Sincronização concluída com sucesso!');
}

sync().catch(err => {
  console.error('Erro na sincronização:', err);
  process.exit(1);
});
