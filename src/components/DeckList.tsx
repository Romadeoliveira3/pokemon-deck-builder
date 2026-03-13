import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Play, Image as ImageIcon, Download } from 'lucide-react';
import { Deck, DeckCard, DeckFormat } from '../types';
import { Language, translations } from '../languages';
import { importDeckFromText } from '../api';
import { SmartImage } from './SmartImage';

interface DeckListProps {
  decks: Deck[];
  language: Language;
  onCreateDeck: (name: string, cards?: DeckCard[], format?: DeckFormat) => void;
  onDeleteDeck: (id: string) => void;
  onDeleteDecks: (ids: string[]) => void;
  onRenameDeck: (id: string, newName: string) => void;
  onSelectDeck: (id: string) => void;
}

export function DeckList({ decks, language, onCreateDeck, onDeleteDeck, onDeleteDecks, onRenameDeck, onSelectDeck }: DeckListProps) {
  const t = translations[language];
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState<DeckFormat>('Standard');
  const [importText, setImportText] = useState('');
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName.trim(), [], newDeckFormat);
      setNewDeckName('');
      setNewDeckFormat('Standard');
      setIsCreating(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (importText.trim() && newDeckName.trim()) {
      setIsImportLoading(true);
      try {
        const cards = await importDeckFromText(importText, language, newDeckFormat);
        onCreateDeck(newDeckName.trim(), cards, newDeckFormat);
        setNewDeckName('');
        setNewDeckFormat('Standard');
        setImportText('');
        setIsImporting(false);
      } catch (error) {
        console.error("Failed to import deck", error);
        alert("Failed to import deck. Please check the format.");
      } finally {
        setIsImportLoading(false);
      }
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRenameDeck(id, editName.trim());
      setEditingId(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && window.confirm(`${t.confirmDelete} (${selectedIds.size} ${t.decks.toLowerCase()})?`)) {
      onDeleteDecks(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsSelectMode(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.decks}</h2>
        <div className="flex gap-3">
          {decks.length > 0 && (
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedIds(new Set());
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shadow-sm ${isSelectMode ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'}`}
            >
              {isSelectMode ? t.cancel : 'Select'}
            </button>
          )}
          {isSelectMode ? (
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Trash2 size={20} />
              {t.delete} ({selectedIds.size})
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsImporting(true)}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Import Deck</span>
              </button>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <Plus size={20} />
                {t.createDeck}
              </button>
            </>
          )}
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.deckName}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!newDeckName.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              {t.create}
            </button>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.format}
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Standard', 'Expanded', 'GLC', 'None'] as DeckFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setNewDeckFormat(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${newDeckFormat === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {t[f.toLowerCase() as keyof typeof t] || f}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {isImporting && (
        <form onSubmit={handleImport} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Import Deck</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.deckName}
            </label>
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.format}
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Standard', 'Expanded', 'GLC', 'None'] as DeckFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setNewDeckFormat(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${newDeckFormat === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {t[f.toLowerCase() as keyof typeof t] || f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deck List (PTCGL Format)
            </label>
            <textarea
              placeholder="Pokémon: 16&#10;1 Mega Mawile ex MEG 94&#10;..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full h-40 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-mono text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setIsImporting(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              disabled={isImportLoading}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!newDeckName.trim() || !importText.trim() || isImportLoading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
            >
              {isImportLoading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <div 
            key={deck.id} 
            className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border transition-all group relative ${isSelectMode && selectedIds.has(deck.id) ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-100 dark:border-gray-700 hover:shadow-md'}`}
            onClick={() => isSelectMode && toggleSelection(deck.id)}
          >
            {isSelectMode && (
              <div className="absolute top-4 left-4 z-20">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.has(deck.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300'}`}>
                  {selectedIds.has(deck.id) && <Play size={12} className="fill-current" style={{ transform: 'rotate(90deg)' }} />}
                </div>
              </div>
            )}
            {editingId === deck.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRename(deck.id)}
                    className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-sm"
                  >
                    {t.save}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1.5 rounded-lg text-sm"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 relative flex-shrink-0 group-hover:opacity-90 transition-opacity">
                  {deck.coverImage ? (
                    <SmartImage src={deck.coverImage} alt="Cover" className="w-full h-full object-cover object-top" />
                  ) : deck.cards.length > 0 ? (
                    <SmartImage src={deck.cards[0].image} alt="Cover" className="w-full h-full object-cover object-top opacity-50" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4" title={deck.name}>
                    {deck.name}
                  </h3>
                  {!isSelectMode && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(deck.id);
                          setEditName(deck.name);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title={t.rename}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t.confirmDelete)) {
                            onDeleteDeck(deck.id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                        title={t.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex justify-between items-center">
                  <span>{deck.cards.reduce((acc, card) => acc + card.quantity, 0)} {t.cardsInDeck.toLowerCase()}</span>
                  {deck.format && deck.format !== 'None' && (
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {deck.format}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => !isSelectMode && onSelectDeck(deck.id)}
                  disabled={isSelectMode}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors font-medium ${isSelectMode ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'}`}
                >
                  <Play size={18} />
                  {t.edit}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
