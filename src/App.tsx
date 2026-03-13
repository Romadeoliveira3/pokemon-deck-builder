import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Heart } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Deck, DeckCard, Card } from './types';
import { Language, translations } from './languages';
import { DeckList } from './components/DeckList';
import { DeckBuilder } from './components/DeckBuilder';
import { FavoritesList } from './components/FavoritesList';
import { DeveloperFooter } from './components/DeveloperFooter';

export default function App() {
  const [decks, setDecks] = useLocalStorage<Deck[]>('pokedeck-decks', []);
  const [favorites, setFavorites] = useLocalStorage<Card[]>('pokedeck-favorites', []);
  const [language, setLanguage] = useLocalStorage<Language>('pokedeck-lang', 'en');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('pokedeck-theme', 'light');
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deckParam = params.get('deck');
    if (deckParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(deckParam)));
        if (decoded && decoded.name && Array.isArray(decoded.cards)) {
          const newDeck: Deck = {
            id: crypto.randomUUID(),
            name: decoded.name + ' (Imported)',
            cards: decoded.cards,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setDecks(prev => [...prev, newDeck]);
          setCurrentDeckId(newDeck.id);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error("Failed to import deck", e);
      }
    }
  }, [setDecks]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleCreateDeck = (name: string, cards: DeckCard[] = []) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      cards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDecks(prev => [...prev, newDeck]);
  };

  const handleDeleteDeck = (id: string) => {
    setDecks(prev => prev.filter(d => d.id !== id));
    if (currentDeckId === id) {
      setCurrentDeckId(null);
    }
  };

  const handleDeleteDecks = (ids: string[]) => {
    setDecks(prev => prev.filter(d => !ids.includes(d.id)));
    if (currentDeckId && ids.includes(currentDeckId)) {
      setCurrentDeckId(null);
    }
  };

  const handleRenameDeck = (id: string, newName: string) => {
    setDecks(prev => prev.map(d => d.id === id ? { ...d, name: newName, updatedAt: Date.now() } : d));
  };

  const handleSaveDeck = (updatedDeck: Deck) => {
    setDecks(prev => prev.map(d => d.id === updatedDeck.id ? updatedDeck : d));
  };

  const handleToggleFavorite = (card: Card) => {
    setFavorites(prev => {
      const isFav = prev.some(c => c.id === card.id);
      if (isFav) {
        return prev.filter(c => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  const currentDeck = decks.find(d => d.id === currentDeckId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 pb-12">
      <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => {
              setCurrentDeckId(null);
              setShowFavorites(false);
            }}
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-xl font-bold hidden sm:block">{t.appTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowFavorites(!showFavorites);
                setCurrentDeckId(null);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showFavorites ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title={t.favorites}
            >
              <Heart size={20} className={showFavorites ? 'fill-current' : ''} />
              <span className="hidden sm:inline font-medium">{t.favorites}</span>
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Globe size={20} />
                <span className="uppercase text-sm font-medium">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {(['en', 'pt', 'es'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl ${language === lang ? 'text-emerald-600 font-medium' : ''}`}
                  >
                    {lang === 'en' ? 'English' : lang === 'pt' ? 'Português' : 'Español'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'light' ? t.themeDark : t.themeLight}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        {showFavorites ? (
          <FavoritesList 
            favorites={favorites} 
            language={language} 
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setShowFavorites(false)}
          />
        ) : currentDeck ? (
          <DeckBuilder
            deck={currentDeck}
            language={language}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setCurrentDeckId(null)}
            onSave={handleSaveDeck}
            onDelete={handleDeleteDeck}
            onRename={handleRenameDeck}
          />
        ) : (
          <DeckList
            decks={decks}
            language={language}
            onCreateDeck={handleCreateDeck}
            onDeleteDeck={handleDeleteDeck}
            onDeleteDecks={handleDeleteDecks}
            onRenameDeck={handleRenameDeck}
            onSelectDeck={setCurrentDeckId}
          />
        )}
      </main>
      <DeveloperFooter />
    </div>
  );
}
