import db from './db';

const LANGUAGES = ['en', 'pt', 'es'];
const BASE_URL = 'https://api.tcgdex.net/v2';

async function sync() {
  console.log('Iniciando sincronização profunda com TCGdex...');

  for (const lang of LANGUAGES) {
    console.log(`\nProcessando idioma: ${lang.toUpperCase()}`);

    // 1. Obter lista básica de coleções
    const setsResponse = await fetch(`${BASE_URL}/${lang}/sets`);
    const basicSets = await setsResponse.json() as any[];
    
    console.log(`- Buscando detalhes de ${basicSets.length} coleções para obter abreviações oficiais...`);
    
    const insertSet = db.prepare('INSERT OR REPLACE INTO sets (id, name, abbreviation, standard, expanded) VALUES (?, ?, ?, ?, ?)');
    
    // Processar em chunks para não sobrecarregar a API
    const CHUNK_SIZE = 10;
    for (let i = 0; i < basicSets.length; i += CHUNK_SIZE) {
      const chunk = basicSets.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (basicSet) => {
        try {
          const detailRes = await fetch(`${BASE_URL}/${lang}/sets/${basicSet.id}`);
          if (detailRes.ok) {
            const detail = await detailRes.json();
            insertSet.run(
              detail.id, 
              detail.name, 
              detail.abbreviation?.official || detail.id.toUpperCase(),
              detail.legal?.standard ? 1 : 0,
              detail.legal?.expanded ? 1 : 0
            );
          } else {
            insertSet.run(basicSet.id, basicSet.name, basicSet.id.toUpperCase(), 0, 0);
          }
        } catch (e) {
          insertSet.run(basicSet.id, basicSet.name, basicSet.id.toUpperCase(), 0, 0);
        }
      }));
      if (i % 50 === 0 && i > 0) console.log(`  ... processadas ${i} coleções`);
    }

    // 2. Sincronizar Cards
    console.log(`- Sincronizando cartas para ${lang}...`);
    const cardsResponse = await fetch(`${BASE_URL}/${lang}/cards`);
    const cards = await cardsResponse.json() as any[];

    const insertCard = db.prepare(`
      INSERT OR REPLACE INTO cards (id, localId, name, image, category, setId, lang)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const cardTransaction = db.transaction((cardsList) => {
      for (const card of cardsList) {
        if (!card.image) continue;
        // Tenta pegar o setId do campo set.id se existir, senão faz o parse do id da carta
        const setId = card.set?.id || card.id.substring(0, card.id.lastIndexOf('-'));
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

  console.log('\nSincronização concluída com sucesso!');
}

sync().catch(err => {
  console.error('Erro na sincronização:', err);
  process.exit(1);
});
