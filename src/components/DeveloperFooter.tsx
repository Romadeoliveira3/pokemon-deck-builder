import React from 'react';

export const DeveloperFooter: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full py-2 px-4 z-[90] border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md select-none group flex items-center justify-between">
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                Have Want BR - PokéDeck Builder
            </p>
            <div className="flex items-center gap-3">
                <div className="h-[2px] w-8 bg-emerald-500 opacity-40 group-hover:w-12 group-hover:opacity-80 transition-all duration-500" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    Dev
                    <a
                        href="https://romadeoliveira3.github.io/portifolio/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-500 hover:text-amber-400 transition-all hover:scale-105 transform origin-center font-black"
                    >
                        Romário J.
                    </a>
                </p>
            </div>
        </div>
    );
};
