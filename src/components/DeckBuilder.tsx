import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Save, Trash2, Edit2, Plus, Minus, List, Share2, ChevronDown, Link, FileText, Image as ImageIcon, Star, Maximize2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Deck, Card, DeckCard, CardFilters } from '../types';
import { AdvancedSearch } from './AdvancedSearch';
import { Language, translations } from '../languages';
import { searchCards } from '../api';
import { CardModal } from './CardModal';
import { SmartImage } from './SmartImage';

interface DeckBuilderProps {
  deck: Deck;
  language: Language;
  favorites: Card[];
  onToggleFavorite: (card: Card) => void;
  onBack: () => void;
  onSave: (deck: Deck) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export function DeckBuilder({ deck, language, favorites, onToggleFavorite, onBack, onSave, onDelete, onRename }: DeckBuilderProps) {
  const t = translations[language];
  const [currentDeck, setCurrentDeck] = useState<Deck>(deck);
  const [searchFilters, setSearchFilters] = useState<CardFilters>({});
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(deck.name);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (Object.keys(searchFilters).length > 0) {
        setIsSearching(true);
        const results = await searchCards(searchFilters, language);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchFilters, language]);

  const handleAddCard = (card: Card) => {
    setCurrentDeck(prev => {
      const existing = prev.cards.find(c => c.id === card.id);
      let newCards;
      if (existing) {
      if (existing.quantity >= 4) return prev;
        newCards = prev.cards.map(c => c.id === card.id ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        newCards = [...prev.cards, { ...card, quantity: 1 }];
      }
      setHasUnsavedChanges(true);
      return { ...prev, cards: newCards, updatedAt: Date.now() };
    });
  };

  const handleRemoveCard = (cardId: string) => {
    setCurrentDeck(prev => {
      const existing = prev.cards.find(c => c.id === cardId);
      if (!existing) return prev;
      
      let newCards;
      if (existing.quantity > 1) {
        newCards = prev.cards.map(c => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c);
      } else {
        newCards = prev.cards.filter(c => c.id !== cardId);
      }
      setHasUnsavedChanges(true);
      return { ...prev, cards: newCards, updatedAt: Date.now() };
    });
  };

  const toggleCardSelection = (id: string) => {
    setSelectedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkRemoveCards = () => {
    if (selectedCardIds.size > 0 && window.confirm(`Remover ${selectedCardIds.size} cartas do deck?`)) {
      setCurrentDeck(prev => ({
        ...prev,
        cards: prev.cards.filter(c => !selectedCardIds.has(c.id)),
        updatedAt: Date.now()
      }));
      setSelectedCardIds(new Set());
      setIsSelectMode(false);
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = () => {
    onSave(currentDeck);
    setHasUnsavedChanges(false);
    alert(t.saveSuccess);
  };

  const handleRename = () => {
    if (editName.trim() && editName !== currentDeck.name) {
      const updatedDeck = { ...currentDeck, name: editName.trim() };
      setCurrentDeck(updatedDeck);
      onRename(deck.id, editName.trim());
      setHasUnsavedChanges(true);
    }
    setIsEditingName(false);
  };

  const handleSetCover = (imageUrl?: string) => {
    if (!imageUrl) return;
    setCurrentDeck(prev => ({ ...prev, coverImage: imageUrl, updatedAt: Date.now() }));
    setHasUnsavedChanges(true);
  };

  const handleCopyLink = () => {
    const deckData = {
      name: currentDeck.name,
      cards: currentDeck.cards.map(c => ({ id: c.id, localId: c.localId, name: c.name, image: c.image, quantity: c.quantity }))
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(deckData)));
    const url = `${window.location.origin}/?deck=${encoded}`;
    navigator.clipboard.writeText(url);
    alert(t.linkCopied);
    setIsShareOpen(false);
  };

  const handleCopyText = () => {
    const pokemons = currentDeck.cards.filter(c => c.category === 'Pokemon');
    const trainers = currentDeck.cards.filter(c => c.category === 'Trainer');
    const energies = currentDeck.cards.filter(c => c.category === 'Energy');
    const others = currentDeck.cards.filter(c => !['Pokemon', 'Trainer', 'Energy'].includes(c.category || ''));

    const formatLine = (c: DeckCard) => `${c.quantity} ${c.name} ${c.setAbbreviation || 'UNK'} ${c.localId}`;

    let text = '';
    
    if (pokemons.length > 0) {
      const count = pokemons.reduce((acc, c) => acc + c.quantity, 0);
      text += `Pokémon: ${count}\n`;
      text += pokemons.map(formatLine).join('\n') + '\n\n';
    }
    
    if (trainers.length > 0) {
      const count = trainers.reduce((acc, c) => acc + c.quantity, 0);
      text += `Trainer: ${count}\n`;
      text += trainers.map(formatLine).join('\n') + '\n\n';
    }
    
    if (energies.length > 0) {
      const count = energies.reduce((acc, c) => acc + c.quantity, 0);
      text += `Energy: ${count}\n`;
      text += energies.map(formatLine).join('\n') + '\n\n';
    }

    if (others.length > 0) {
      const count = others.reduce((acc, c) => acc + c.quantity, 0);
      text += `Other: ${count}\n`;
      text += others.map(formatLine).join('\n') + '\n\n';
    }

    navigator.clipboard.writeText(text.trim());
    alert(t.textCopied);
    setIsShareOpen(false);
  };

  const handleDownloadImage = async () => {
    if (deckRef.current) {
      try {
        const canvas = await html2canvas(deckRef.current, { 
          useCORS: true, 
          allowTaint: true,
          backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff' 
        });
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDeck.name}.png`;
        a.click();
      } catch (error) {
        console.error('Failed to generate image', error);
        alert('Failed to generate image. Some card images might not support export.');
      }
    }
    setIsShareOpen(false);
  };

  const totalCards = currentDeck.cards.reduce((acc, card) => acc + card.quantity, 0);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden">
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col h-[30vh] lg:h-full flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <AdvancedSearch language={language} onSearch={setSearchFilters} />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isSearching ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t.loading}</div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {searchResults.map(card => (
                <div key={card.id} className="relative group cursor-pointer flex flex-col" onClick={() => setSelectedCard(card)}>
                  <div className="relative">
                    <SmartImage src={card.image} alt={card.name} className="w-full rounded-lg shadow-sm group-hover:shadow-md transition-all group-hover:scale-105" loading="lazy" crossOrigin="anonymous" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2 z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddCard(card); }}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors"
                        title={t.addToDeck}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-center mt-2 font-medium text-gray-700 dark:text-gray-300 truncate px-1" title={card.name}>
                    {card.name}
                  </span>
                </div>
              ))}
            </div>
          ) : Object.keys(searchFilters).length > 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t.noCardsFound}</div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t.searchCards}</div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-[40vh] lg:h-full bg-white dark:bg-gray-900 min-h-[300px] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  autoFocus
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentDeck.name}</h2>
                <button onClick={() => setIsEditingName(true)} className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-500 transition-all">
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${totalCards === 60 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
              {totalCards} / 60
            </span>

            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedCardIds(new Set());
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors shadow-sm ${isSelectMode ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}`}
            >
              {isSelectMode ? t.cancel : 'Select'}
            </button>

            {isSelectMode && (
              <button
                onClick={handleBulkRemoveCards}
                disabled={selectedCardIds.size === 0}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <Trash2 size={18} />
                {t.delete} ({selectedCardIds.size})
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setIsShareOpen(!isShareOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl transition-colors shadow-sm"
              >
                <Share2 size={18} />
                <span className="hidden sm:inline">{t.share}</span>
                <ChevronDown size={16} />
              </button>

              {isShareOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsShareOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                    <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Link size={16} /> {t.copyImportLink}
                    </button>
                    <button onClick={handleCopyText} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <FileText size={16} /> {t.copyAsText}
                    </button>
                    <button onClick={handleDownloadImage} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <ImageIcon size={16} /> {t.downloadImage}
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-sm"
            >
              <Save size={18} />
              <span className="hidden sm:inline">{t.save}</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(t.confirmDelete)) {
                  onDelete(deck.id);
                  onBack();
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              title={t.delete}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900/20 pb-20" ref={deckRef}>
          {currentDeck.cards.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t.deckEmpty}
            </div>
          ) : (
            <div className="space-y-8">
              {[
                { title: 'Pokémon', key: 'Pokemon' },
                { title: 'Trainer', key: 'Trainer' },
                { title: 'Energy', key: 'Energy' },
                { title: 'Other', key: 'Other' }
              ].map(section => {
                const sectionCards = currentDeck.cards.filter(c => 
                  section.key === 'Other' 
                    ? !['Pokemon', 'Trainer', 'Energy'].includes(c.category || '')
                    : c.category === section.key
                );

                if (sectionCards.length === 0) return null;

                const count = sectionCards.reduce((acc, c) => acc + c.quantity, 0);

                return (
                  <div key={section.key} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-2">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2">
                        {section.title}
                        <span className="text-[10px] bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">
                          {count}
                        </span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {sectionCards.map(card => (
                        <div 
                          key={card.id} 
                          className={`relative group flex flex-col cursor-pointer border rounded-xl p-1 transition-all ${isSelectMode && selectedCardIds.has(card.id) ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent'}`} 
                          onClick={() => isSelectMode ? toggleCardSelection(card.id) : setSelectedCard(card)}
                        >
                          <div className="relative">
                            <SmartImage src={card.image} alt={card.name} className="w-full rounded-lg shadow-sm" loading="lazy" crossOrigin="anonymous" />
                            {isSelectMode && (
                              <div className="absolute top-2 left-2 z-20">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCardIds.has(card.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/80 border-gray-300'}`}>
                                  {selectedCardIds.has(card.id) && <Plus size={12} className="rotate-45" />}
                                </div>
                              </div>
                            )}
                            {currentDeck.coverImage === card.image && (
                              <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 z-10" title="Cover Image">
                                <Star size={16} className="fill-current" />
                              </div>
                            )}
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white dark:border-gray-800 z-10">
                              {card.quantity}
                            </div>
                            {!isSelectMode && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-3 z-10">
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveCard(card.id); }}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                  >
                                    <Minus size={20} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleAddCard(card); }}
                                    disabled={card.quantity >= 4}
                                    className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-full transition-colors"
                                  >
                                    <Plus size={20} />
                                  </button>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSetCover(card.image); }}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${currentDeck.coverImage === card.image ? 'bg-yellow-500 text-white' : 'bg-gray-800/80 text-white hover:bg-yellow-500'}`}
                                >
                                  <Star size={14} className={currentDeck.coverImage === card.image ? 'fill-current' : ''} />
                                  {t.setCover}
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-center mt-2 font-medium text-gray-700 dark:text-gray-300 truncate px-1" title={card.name}>
                            {card.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-[30vh] lg:h-full flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <List size={18} />
            {t.cardsInDeck}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {currentDeck.cards.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              {t.deckEmpty}
            </div>
          ) : (
            currentDeck.cards.map(card => (
              <div key={card.id} className="flex items-center justify-between text-sm group p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 w-4">{card.quantity}x</span>
                  <span className="text-gray-700 dark:text-gray-300 truncate" title={card.name}>{card.name}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0">
                  <button onClick={() => handleRemoveCard(card.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded transition-colors">
                    <Minus size={14} />
                  </button>
                  <button onClick={() => handleAddCard(card)} disabled={card.quantity >= 4} className="text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50 p-1 rounded transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          language={language}
          isFavorite={favorites.some(c => c.id === selectedCard.id)}
          onClose={() => setSelectedCard(null)}
          onToggleFavorite={onToggleFavorite}
          onAdd={handleAddCard}
        />
      )}
    </div>
  );
}
