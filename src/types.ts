export type DeckFormat = 'Standard' | 'Expanded' | 'GLC' | 'None';

export interface CardFilters {
  name?: string;
  category?: string[];
  trainerType?: string[];
  energyType?: string[];
  types?: string[];
  stage?: string[];
  hp?: number;
  retreat?: number;
  rarity?: string[];
  set?: string;
  setAbbreviation?: string;
  format?: DeckFormat;
  serie?: string;
  localId?: string;
}

export interface Card {
  id: string;
  localId: string;
  name: string;
  image?: string;
  category?: string;
  setAbbreviation?: string;
}

export interface DeckCard extends Card {
  quantity: number;
}

export interface Deck {
  id: string;
  name: string;
  format?: DeckFormat;
  cards: DeckCard[];
  coverImage?: string;
  createdAt: number;
  updatedAt: number;
}
