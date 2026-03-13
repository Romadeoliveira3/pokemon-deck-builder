import React from 'react';

export const DeveloperFooter: React.FC = () => {
    return (
        <div className="w-full py-6 text-center mt-auto px-4 select-none group border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-black uppercase tracking-[0.3em] mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                Have Want BR - PokéDeck Builder
            </p>
            <div className="h-[2px] w-12 bg-emerald-500 mx-auto mb-4 opacity-40 group-hover:w-16 group-hover:opacity-80 transition-all duration-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight uppercase tracking-[0.2em] font-black">
                Dev
                <a
                    href="https://romadeoliveira3.github.io/portifolio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-400 transition-all block mt-2 hover:scale-105 transform origin-center text-xs"
                >
                    Romário J.
                </a>
            </p>
        </div>
    );
};
