import { Combobox } from '@headlessui/react';
import { Search } from 'lucide-react';
import {usePlayerFilter} from "@/hooks/use-player-filter.ts";
import {IPlayerOption} from "@/models/leaderboard.ts";

export const PlayerFilter = () => {
    const {
        query,
        setQuery,
        players,
        isLoading,
        selectedPlayer,
        handleOnSelectPlayer
    } = usePlayerFilter();

    return (
        <Combobox value={selectedPlayer} onChange={handleOnSelectPlayer}>
            <div className="ml-0 md:ml-8 z-50">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-black dark:text-white " />
                    <Combobox.Input
                        className="h-10 w-full rounded-lg bg-white dark:bg-[#1c172b] border border-gray-200 dark:border-purple-600 pl-10 pr-4 text-base text-black dark:text-white placeholder:text-black dark:placeholder:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Search"
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={(person: IPlayerOption) => person?.name ?? ''}
                    />
                </div>

                {(query || isLoading || players.length > 0) && (
                    <Combobox.Options className="absolute mt-2 max-h-60 w-2/3 md:w-9/12 overflow-auto rounded-lg bg-white dark:bg-[#1C1B1F] py-2 shadow-xl ring-1 ring-white/10" style={{zIndex: 999}}>
                        {isLoading && (
                            <div className="px-4 py-2 text-sm text-black/50 dark:text-white">Loading...</div>
                        )}

                        {!isLoading && players.length === 0 && query !== '' && (
                            <div className="px-4 py-2 text-sm text-black/50 dark:text-white">No results found</div>
                        )}

                        {players.map((player) => (
                            <Combobox.Option
                                key={player.id}
                                value={player}
                                className={({ active }) =>
                                    `relative z-50 cursor-pointer select-none px-4 py-2 text-sm ${
                                        active
                                            ? 'bg-violet-500/10 text-violet-400'
                                            : 'text-black dark:text-white'
                                    }`
                                }
                            >
                                <div className={'flex flex-row items-center font-medium gap-x-3'}>
                                    <img
                                        src={player.country.flag}
                                        alt={player.country.name}
                                        className="h-8 w-8 rounded-full" />

                                    {player.name}
                                </div>
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                )}
            </div>
        </Combobox>
    );
};
