import { Card, DeckCard } from './types';
import { Language } from './languages';

const BASE_URL = 'https://api.tcgdex.net/v2';

const setAbbreviationCache: Record<string, string> = {};

async function getSetAbbreviation(setId: string, lang: Language): Promise<string> {
  if (setAbbreviationCache[setId]) {
    return setAbbreviationCache[setId];
  }
  try {
    const response = await fetch(`${BASE_URL}/${lang}/sets/${setId}`);
    if (response.ok) {
      const data = await response.json();
      const abbr = data.abbreviation?.official || setId.toUpperCase();
      setAbbreviationCache[setId] = abbr;
      return abbr;
    }
  } catch (e) {
    console.error('Failed to fetch set abbreviation', e);
  }
  return setId.toUpperCase();
}

export async function searchCards(filters: import('./types').CardFilters, lang: Language): Promise<Card[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.name?.trim()) queryParams.append('name', filters.name.trim());
    if (filters.category?.length) queryParams.append('category', filters.category.join(','));
    if (filters.trainerType?.length) queryParams.append('trainerType', filters.trainerType.join(','));
    if (filters.energyType?.length) queryParams.append('energyType', filters.energyType.join(','));
    if (filters.types?.length) queryParams.append('types', filters.types.join(','));
    if (filters.stage?.length) queryParams.append('stage', filters.stage.join(','));
    if (filters.hp) queryParams.append('hp', filters.hp.toString());
    if (filters.retreat !== undefined) queryParams.append('retreat', filters.retreat.toString());
    if (filters.rarity?.length) queryParams.append('rarity', filters.rarity.join(','));
    if (filters.set) queryParams.append('set', filters.set);
    if (filters.serie) queryParams.append('serie', filters.serie);

    if ([...queryParams.keys()].length === 0) return [];

    const response = await fetch(`${BASE_URL}/${lang}/cards?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch cards');
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data)) return [];

    const cards = data
      .filter((c: any) => c.image)
      .slice(0, 50);

    if (cards.length === 0) return [];

    const ids = cards.map((c: any) => c.id);
    const graphqlQuery = `
      query {
        ${ids.map((id: string, i: number) => `c${i}: card(id: "${id}") { id, category, set { id } }`).join('\n')}
      }
    `;

    const detailResponse = await fetch(`${BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: graphqlQuery })
    });

    const detailData = await detailResponse.json();
    const details = detailData?.data || {};

    const uniqueSetIds = [...new Set(Object.values(details).map((d: any) => d?.set?.id).filter(Boolean))] as string[];
    await Promise.all(uniqueSetIds.map(id => getSetAbbreviation(id, lang)));

    return cards.map((c: any, i: number) => {
      const detail = details[`c${i}`] || {};
      return {
        id: c.id,
        localId: c.localId,
        name: c.name,
        image: `${c.image}/low.png`,
        category: detail.category,
        setAbbreviation: detail.set?.id ? setAbbreviationCache[detail.set.id] : undefined
      };
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

export async function importDeckFromText(text: string, lang: Language): Promise<DeckCard[]> {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const deckCards: DeckCard[] = [];

  const cardRegex = /^(\d+)x?\s+(.+?)\s+([A-Z0-9\-]+)\s+([A-Z0-9]+)$/i;

  const energyMap: Record<Language, Record<string, string>> = {
    en: {
      '{G}': 'Grass',
      '{R}': 'Fire',
      '{W}': 'Water',
      '{L}': 'Lightning',
      '{P}': 'Psychic',
      '{F}': 'Fighting',
      '{D}': 'Darkness',
      '{M}': 'Metal',
      '{Y}': 'Fairy'
    },
    pt: {
      '{G}': 'Energia de Grama',
      '{R}': 'Energia de Fogo',
      '{W}': 'Energia de Água',
      '{L}': 'Energia de Raios',
      '{P}': 'Energia Psíquica',
      '{F}': 'Energia de Luta',
      '{D}': 'Energia Noturna',
      '{M}': 'Energia de Metal',
      '{Y}': 'Energia de Fada'
    },
    es: {
      '{G}': 'Energía Planta',
      '{R}': 'Energía Fuego',
      '{W}': 'Energía Agua',
      '{L}': 'Energía Rayo',
      '{P}': 'Energía Psíquica',
      '{F}': 'Energía Lucha',
      '{D}': 'Energía Oscura',
      '{M}': 'Energía Metálica',
      '{Y}': 'Energía Hada'
    }
  };

  for (const line of lines) {
    const match = line.match(cardRegex);
    if (match) {
      const quantity = parseInt(match[1], 10);
      let name = match[2].trim();
      const setAbbr = match[3].toUpperCase();
      const localId = match[4];

      if ((name.includes('Basic') || name.includes('Básica') || name.includes('Básica')) && name.includes('{') && name.includes('}')) {
        for (const [key, value] of Object.entries(energyMap[lang])) {
          if (name.includes(key)) {
            name = lang === 'en' ? `${value} Energy` : value;
            break;
          }
        }
      } else {
        name = name.replace(/\s+\(.*?\)$/, '');
      }

      const results = await searchCards({ name }, lang);
      
      const matchLocalId = (a: string, b: string) => {
        if (a === b) return true;
        const numA = parseInt(a.replace(/\D/g, ''), 10);
        const numB = parseInt(b.replace(/\D/g, ''), 10);
        if (!isNaN(numA) && !isNaN(numB) && numA === numB) {
          return a.replace(/\d/g, '').toLowerCase() === b.replace(/\d/g, '').toLowerCase();
        }
        return false;
      };

      let matchedCard = results.find(c => 
        matchLocalId(c.localId, localId) && 
        (c.setAbbreviation === setAbbr || c.id.includes(setAbbr.toLowerCase()))
      );

      if (!matchedCard) {
        matchedCard = results.find(c => matchLocalId(c.localId, localId));
      }

      if (!matchedCard && results.length > 0) {
        matchedCard = results[0];
      }

      if (matchedCard) {
        deckCards.push({
          ...matchedCard,
          quantity
        });
      } else {
        deckCards.push({
          id: `stub-${crypto.randomUUID()}`,
          localId,
          name,
          image: 'https://picsum.photos/seed/pokemon/240/330',
          category: 'Pokemon',
          setAbbreviation: setAbbr,
          quantity
        });
      }
    }
  }

  return deckCards;
}
