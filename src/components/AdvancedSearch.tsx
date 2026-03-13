import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { CardFilters } from '../types';
import { translations, Language } from '../languages';

interface AdvancedSearchProps {
  language: Language;
  onSearch: (filters: CardFilters) => void;
}

const POKEMON_TYPES = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Fairy', 'Dragon', 'Colorless'];
const STAGES = ['Basic', 'Stage 1', 'Stage 2', 'VSTAR', 'VMAX', 'MEGA', 'BREAK'];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Double Rare', 'Ultra Rare', 'Secret Rare', 'Art Rare', 'Special Art Rare'];

export function AdvancedSearch({ language, onSearch }: AdvancedSearchProps) {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<CardFilters>({});

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(filters);
    setIsOpen(false);
  };

  const toggleArrayFilter = (key: keyof CardFilters, value: string) => {
    setFilters(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated.length > 0 ? updated : undefined };
    });
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={(e) => { e.preventDefault(); onSearch(filters); }} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t.searchCards}
            value={filters.name || ''}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          {filters.name && (
            <button
              type="button"
              onClick={() => {
                const newFilters = { ...filters, name: undefined };
                setFilters(newFilters);
                onSearch(newFilters);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Advanced Search"
        >
          <SlidersHorizontal size={20} />
        </button>
      </form>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={24} className="text-emerald-500" />
                Advanced Search
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Card Type</h3>
                <div className="flex flex-wrap gap-2">
                  {['Pokemon', 'Trainer', 'Energy'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayFilter('category', type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(filters.category || []).includes(type) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {(!filters.category || filters.category.includes('Trainer')) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Trainer Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Item', 'Supporter', 'Stadium', 'Tool'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleArrayFilter('trainerType', type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(filters.trainerType || []).includes(type) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(!filters.category || filters.category.includes('Energy')) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Energy Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Normal', 'Special'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleArrayFilter('energyType', type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(filters.energyType || []).includes(type) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                      >
                        {type === 'Normal' ? 'Basic' : type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(!filters.category || filters.category.includes('Pokemon')) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Pokémon Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {POKEMON_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleArrayFilter('types', type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(filters.types || []).includes(type) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(!filters.category || filters.category.includes('Pokemon')) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Stage</h3>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map(stage => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => toggleArrayFilter('stage', stage)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(filters.stage || []).includes(stage) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(!filters.category || filters.category.includes('Pokemon')) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">HP</h3>
                    <input
                      type="number"
                      min="30"
                      step="10"
                      placeholder="e.g. 120"
                      value={filters.hp || ''}
                      onChange={(e) => setFilters({ ...filters, hp: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                {(!filters.category || filters.category.includes('Pokemon')) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Retreat Cost</h3>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      placeholder="e.g. 2"
                      value={filters.retreat !== undefined ? filters.retreat : ''}
                      onChange={(e) => setFilters({ ...filters, retreat: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
