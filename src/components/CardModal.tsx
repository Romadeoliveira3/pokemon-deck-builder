import React from 'react';
import { X, Heart, Plus } from 'lucide-react';
import { Card } from '../types';
import { Language, translations } from '../languages';
import { SmartImage } from './SmartImage';

interface CardModalProps {
  card: Card;
  language: Language;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (card: Card) => void;
  onAdd?: (card: Card) => void;
}

export function CardModal({ card, language, isFavorite, onClose, onToggleFavorite, onAdd }: CardModalProps) {
  const t = translations[language];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4">{card.name}</h3>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex justify-center bg-gray-50 dark:bg-gray-800/50">
          <SmartImage 
            src={card.image} 
            alt={card.name} 
            className="w-full max-w-[350px] h-auto rounded-xl shadow-lg"
            crossOrigin="anonymous"
          />
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-center">
          <button
            onClick={() => onToggleFavorite(card)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
              isFavorite 
                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
            {isFavorite ? t.removeFavorite : t.addFavorite}
          </button>
          
          {onAdd && (
            <button
              onClick={() => {
                onAdd(card);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus size={20} />
              {t.addToDeck}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
