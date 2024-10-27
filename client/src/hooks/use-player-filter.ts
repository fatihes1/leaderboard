import { IPlayerOption } from "@/models/leaderboard.ts";
import {useEffect, useState, useCallback, useContext} from "react";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { fetchLeaderboardRequest } from "@/requests/leaderboard/leaderboard-requests.ts";
import {LeaderboardContext} from "@/providers/leaderboard/leaderboard-provider.tsx";

interface UsePlayerFilterReturn {
    query: string;
    setQuery: (query: string) => void;
    players: IPlayerOption[];
    isLoading: boolean;
    selectedPlayer: IPlayerOption | null;
    setSelectedPlayer: (player: IPlayerOption | null) => void;
    handleOnSelectPlayer: (player: IPlayerOption | null) => void;
}

export const usePlayerFilter = (): UsePlayerFilterReturn => {
    const [query, setQuery] = useState<string>('');
    const [players, setPlayers] = useState<IPlayerOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedPlayer, setSelectedPlayer] = useState<IPlayerOption | null>(null);

    const {setSelectedUserId} = useContext(LeaderboardContext);

    const debouncedQuery = useDebounce(query, 300);

    const fetchPlayers = useCallback(async () => {
        if (!debouncedQuery) {
            setPlayers([]);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetchLeaderboardRequest(debouncedQuery);
            setPlayers(response.data.suggestions);
        } catch (error) {
            console.error('Leaderboard fetch error:', error);
            setPlayers([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedQuery]);

    const handleOnSelectPlayer = (player: IPlayerOption | null) => {
        setSelectedUserId(player?.id ?? 0);
        setSelectedPlayer(player);
    }


    useEffect(() => {
        (async () => {
            await fetchPlayers();
        })();

        return () => {
            setPlayers([]);
        };
    }, [fetchPlayers]);

    return {
        query,
        setQuery,
        players,
        isLoading,
        selectedPlayer,
        setSelectedPlayer,
        handleOnSelectPlayer
    };
};