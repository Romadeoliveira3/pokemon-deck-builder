import React, { useState } from 'react';
import { Heart, Search, X, ArrowLeft } from 'lucide-react';
import { Card } from '../types';
import { Language, translations } from '../languages';
import { CardModal } from './CardModal';

interface FavoritesListProps {
  favorites: Card[];
  language: Language;
  onToggleFavorite: (card: Card) => void;
  onBack: () => void;
}

export function FavoritesList({ favorites, language, onToggleFavorite, onBack }: FavoritesListProps) {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const filteredFavorites = favorites.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={t.backToDecks}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Heart className="text-red-500 fill-current" size={32} />
            {t.favorites}
          </h2>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t.searchCards}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <Heart className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t.noFavorites}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.noFavoritesDesc}
          </p>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">
            {t.noCardsFound}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFavorites.map(card => (
            <div 
              key={card.id} 
              className="relative group cursor-pointer flex flex-col"
              onClick={() => setSelectedCard(card)}
            >
              <div className="relative">
                <img 
                  src={card.image} 
                  alt={card.name} 
                  className="w-full rounded-lg shadow-sm group-hover:shadow-md transition-all group-hover:scale-105" 
                  loading="lazy" 
                  crossOrigin="anonymous" 
                />
                <div className="absolute top-2 right-2 z-10">
                  <Heart className="text-red-500 fill-current drop-shadow-md" size={24} />
                </div>
              </div>
              <span className="text-xs text-center mt-2 font-medium text-gray-700 dark:text-gray-300 truncate px-1" title={card.name}>
                {card.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedCard && (
        <CardModal
          card={selectedCard}
          language={language}
          isFavorite={favorites.some(c => c.id === selectedCard.id)}
          onClose={() => setSelectedCard(null)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
}
