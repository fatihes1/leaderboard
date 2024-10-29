import {TableColumn} from "../../components/ui/tables/base-table.tsx";
import React, {createContext, useEffect, useMemo, useState} from "react";
import {IGroupedPlayers, IPlayer} from "@/models/leaderboard.ts";
import {fetchLeaderboardRequest} from "@/requests/leaderboard/leaderboard-requests.ts";


interface ILeaderboardContext {
    columns: TableColumn<IPlayer>[];
    groupedColumns: TableColumn<IPlayer>[];
    data: IPlayer[];
    groupedData: IGroupedPlayers[];
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    selectedUserId: number;
    setSelectedUserId: (userId: number) => void;
    isGroupView: boolean;
    setIsGroupView: (groupView: boolean) => void;
    toggleGroupView: () => void;
}

export const LeaderboardContext = createContext<ILeaderboardContext>({
    columns: [],
    groupedColumns: [],
    data: [],
    groupedData: [],
    isLoading: false,
    setIsLoading: () => {},
    selectedUserId: 0,
    setSelectedUserId: () => {},
    isGroupView: false,
    setIsGroupView: () => {},
    toggleGroupView: () => {}
})

export const LeaderboardProvider = ({children}: {children: React.ReactNode}) => {
    const [data, setData] = useState<IPlayer[]>([]);
    const [groupedData, setGroupedData] = useState<IGroupedPlayers[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedUserId, setSelectedUserId] = useState<number>(0);
    const [isGroupView, setIsGroupView] = useState<boolean>(false);

    useEffect(() => {
        fetchLeaderboard();
    }, [selectedUserId, isGroupView]);

    useEffect(() => {
        if (data.length > 0) {
            const grouped = groupPlayersByCountry(data);
            setGroupedData(grouped);
        }
    }, [data]);

    const columns: TableColumn<IPlayer>[] = useMemo(() =>  [
        {
            id: 'rank',
            header: 'Ranking',
            accessorKey: 'rank',
            size: 50,
            cell: ({ row }) => {
                const isSelected = row.original.id === selectedUserId;
                const textColorClass = isSelected ? 'text-purple-700 font-bold' : 'text-inherit';

                return (
                    <div className={`font-press-start pl-3 ${textColorClass}`}>
                        {row.original.rank}
                    </div>
                )
            }
        },
        {
            id: 'name',
            header: 'Player Name',
            accessorKey: 'name',
            minSize: 300,
            maxSize: 300,
            cell: ({ row }) => {
                const isSelected = row.original.id === selectedUserId;
                const textColorClass = isSelected ? 'text-purple-700 font-semibold' : 'text-inherit';
                return (
                    <div className={`flex pl-3 truncate ${textColorClass}`}>
                        {row.original.name}
                    </div>
                );
            }
        },
        {
            id: 'country',
            header: 'Country',
            accessorKey: 'country',
            minSize: 350,
            maxSize: 350,
            cell: ({ row }) => {
                const isSelected = row.original.id === selectedUserId;
                const textColorClass = isSelected ? 'text-purple-700 font-semibold' : 'text-inherit';
                return (
                    <div className={`flex items-center truncate ${textColorClass}`}>
                        <img src={row.original.country.flag} alt={row.original.country.name} className="w-4 h-4 mr-2 md:w-4 md:h-4 rounded-full object-fit"/>
                        {row.original.country.name}
                    </div>
                );
            }
        },
        {
            id: 'money',
            header: 'Money',
            accessorKey: 'money',
            minSize: 150,
            maxSize: 150,
            cell: ({ row }) => {
                const isSelected = row.original.id === selectedUserId;
                const textColorClass = isSelected ? 'text-purple-700 font-semibold' : 'text-inherit';
                return (
                    <div className={`text-highlight-purple  ${textColorClass}`}>
                        {row.original.money}
                    </div>
                );
            }
        }
    ], [selectedUserId])

    const groupedColumns: TableColumn<IPlayer>[] = useMemo(() =>
        [
            {
                id: 'rank',
                header: 'Ranking',
                accessorKey: 'rank',
                size: 50,
                cell: ({ row }) => {
                    return (
                        <div className={`font-press-start pl-3 ${
                            row.original.id === selectedUserId ? 'text-purple-700 font-bold' : 'text-inherit'
                        }`}>
                            {row.original.rank}
                        </div>
                    )
                }
            },
            {
                id: 'name',
                header: 'Player Name',
                accessorKey: 'name',
                minSize: 300,
                maxSize: 300,
                cell: ({ row }) => (
                    <div className={`flex pl-3 truncate ${
                        row.original.id === selectedUserId ? 'text-purple-700 font-semibold' : 'text-inherit'
                    }`}>
                        {row.original.name}
                    </div>
                )
            },
            {
                id: 'money',
                header: 'Money',
                accessorKey: 'money',
                minSize: 150,
                maxSize: 150,
                cell: ({ row }) => (
                    <div className={`text-highlight-purple ${
                        row.original.id === selectedUserId ? 'text-purple-700 font-semibold' : 'text-inherit'
                    }`}>
                        {row.original.money}
                    </div>
                )
            }
        ], [selectedUserId]);

    const toggleGroupView = () => {
        setIsGroupView((prev) => !prev);
    }

    const fetchLeaderboard =  () => {
        setIsLoading(true)
        fetchLeaderboardRequest(undefined, Number(selectedUserId)).then((response) => {
            const top100Players = response.data.topPlayers;
            const surroundingPlayers = response.data.surroundingPlayers;
            if (surroundingPlayers.length > 0) {
                const uniqueSurroundingPlayers = surroundingPlayers.filter((player: IPlayer) =>
                    !top100Players.some((topPlayer: IPlayer) => topPlayer.id === player.id)
                );
                top100Players.push(...uniqueSurroundingPlayers);
            }
            setData(top100Players)

        }).catch((error) => {
            console.error(error)
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const groupPlayersByCountry = (players: IPlayer[]): IGroupedPlayers[] => {
        const grouped = players.reduce((acc, player) => {
            const countryName = player.country.name;
            if (!acc[countryName]) {
                acc[countryName] = {
                    country: player.country,
                    players: []
                };
            }
            acc[countryName].players.push(player);
            return acc;
        }, {} as Record<string, IGroupedPlayers>);

        return Object.values(grouped);
    };

    return (
        <LeaderboardContext.Provider value={{ columns, data, isLoading, setIsLoading, selectedUserId, setSelectedUserId, isGroupView, setIsGroupView, toggleGroupView, groupedColumns, groupedData }}>
            {children}
        </LeaderboardContext.Provider>
    )

}