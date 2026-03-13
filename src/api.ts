import { Card, DeckCard } from './types';
import { Language } from './languages';
import { getLimitlessCardImage } from './utils/limitless';

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
    if (filters.setAbbreviation) queryParams.append('setAbbreviation', filters.setAbbreviation);
    if (filters.format) queryParams.append('format', filters.format);

    const response = await fetchWithRetry(`/api/cards?${queryParams.toString()}`);
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

async function importFromLimitless(text: string): Promise<any> {
  console.log('Iniciando requisição para Limitless TCG...');
  try {
    const response = await fetch('https://limitlesstcg.com/api/dm/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text })
    });
    if (!response.ok) {
      console.error(`Erro na API do Limitless: ${response.status} ${response.statusText}`);
      throw new Error('Limitless API error');
    }
    const data = await response.json();
    console.log(`Limitless retornou ${data.cards?.length || 0} cartas.`);
    return data;
  } catch (error) {
    console.error('Falha crítica na conexão com Limitless:', error);
    return null;
  }
}

export async function importDeckFromText(text: string, lang: Language, _format?: import('./types').DeckFormat): Promise<DeckCard[]> {
  console.log('--- INÍCIO DA IMPORTAÇÃO (MOTOR LIMITLESS) ---');
  
  const limitlessData = await importFromLimitless(text);
  
  if (!limitlessData || !limitlessData.cards || limitlessData.cards.length === 0) {
    console.warn('Importação cancelada: Nenhum dado válido recebido do Limitless.');
    if (limitlessData?.errors?.length > 0) {
      console.error('Erros reportados pelo Limitless:', limitlessData.errors);
    }
    return [];
  }

  console.log(`Limitless identificou ${limitlessData.cards.length} cartas. Mapeando imagens via DigitalOcean/PokemonTCG.io...`);

  const mappedCards = limitlessData.cards.map((lCard: any) => {
    const quantity = lCard.count || 1;
    const name = lCard.name;
    const set = lCard.set?.toUpperCase();
    const number = lCard.number;

    // Gerar imagem usando a lógica exata do tabletop
    const imageUrl = getLimitlessCardImage(lCard);
    
    console.log(`  Mapeado: ${quantity}x ${name} [${set} ${number}] -> ${imageUrl}`);

    return {
      id: lCard.data_id ? `limitless-${lCard.data_id}` : `limitless-${crypto.randomUUID()}`,
      localId: number,
      name,
      image: imageUrl,
      category: lCard.card_type === 'pokemon' ? 'Pokemon' : (lCard.card_type === 'energy' ? 'Energy' : 'Trainer'),
      setAbbreviation: set,
      quantity
    };
  });

  console.log(`--- IMPORTAÇÃO CONCLUÍDA: ${mappedCards.length} itens processados ---`);
  return mappedCards;
}
