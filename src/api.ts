import { Card, DeckCard } from './types';
import { Language } from './languages';

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      return response;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries`);
}

export async function searchCards(filters: import('./types').CardFilters, lang: Language): Promise<Card[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('lang', lang);
    if (filters.name?.trim()) queryParams.append('name', filters.name.trim());
    if (filters.category?.length) queryParams.append('category', filters.category[0]);
    if (filters.localId) queryParams.append('localId', filters.localId);

    const response = await fetchWithRetry(`/api/cards?${queryParams.toString()}`);
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

export async function importDeckFromText(text: string, lang: Language): Promise<DeckCard[]> {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const cardRegex = /^(\d+)x?\s+(.+?)\s+([A-Z0-9\-]+)\s+([A-Z0-9]+)$/i;

  const promises = lines.map(async (line) => {
    const match = line.match(cardRegex);
    if (!match) return null;

    const quantity = parseInt(match[1], 10);
    const name = match[2].trim().replace(/\s+\(.*?\)$/, '');
    const setAbbr = match[3].toUpperCase();
    const localId = match[4];

    // Estrategia 1: Nome + localId (mais preciso)
    let results = await searchCards({ name, localId }, lang);
    
    // Estrategia 2: Se falhar e tiver localId, tenta apenas localId (muito comum em collections numeradas)
    if (results.length === 0 && localId) {
      results = await searchCards({ localId }, lang);
    }

    // Estrategia 3: Se falhar, tenta apenas o nome
    if (results.length === 0) {
      results = await searchCards({ name }, lang);
    }

    let matchedCard = results.find(c => 
      c.localId === localId && 
      (c.setAbbreviation === setAbbr || c.id.includes(setAbbr.toLowerCase()))
    );

    if (!matchedCard) {
      matchedCard = results.find(c => c.localId === localId);
    }

    if (!matchedCard && results.length > 0) {
      matchedCard = results[0];
    }

    if (matchedCard) {
      return { ...matchedCard, quantity };
    } else {
      return {
        id: `stub-${crypto.randomUUID()}`,
        localId,
        name,
        image: 'https://assets.tcgdex.net/univ/card/back/low.png',
        category: 'Pokemon',
        setAbbreviation: setAbbr,
        quantity
      };
    }
  });

  const resolvedCards = await Promise.all(promises);
  return resolvedCards.filter((c): c is DeckCard => c !== null);
}
