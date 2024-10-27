import {TableColumn} from "../../components/ui/tables/base-table.tsx";
import React, {createContext, useEffect, useMemo, useState} from "react";
import {IPlayer} from "../../models/leaderboard.ts";
import {fetchLeaderboardRequest} from "../../requests/leaderboard/leaderboard-requests.ts";


interface ILeaderboardContext {
    columns: TableColumn<IPlayer>[];
    data: IPlayer[];
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    selectedUserId: number;
    setSelectedUserId: (userId: number) => void;
}

export const LeaderboardContext = createContext<ILeaderboardContext>({
    columns: [],
    data: [],
    isLoading: false,
    setIsLoading: () => {},
    selectedUserId: 0,
    setSelectedUserId: () => {}
})

export const LeaderboardProvider = ({children}: {children: React.ReactNode}) => {
    const [data, setData] = useState<IPlayer[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedUserId, setSelectedUserId] = useState<number>(0);

    useEffect(() => {
        fetchLeaderboard();
    }, [selectedUserId]);

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


    const fetchLeaderboard =  () => {
        fetchLeaderboardRequest(undefined, Number(selectedUserId)).then((response) => {
            const top100Players = response.data.topPlayers;
            const surroundingPlayers = response.data.surroundingPlayers;
            if (surroundingPlayers.length > 0) {
                top100Players.push(...surroundingPlayers);
            }
            console.log(top100Players)
            setData(top100Players)

        }).catch((error) => {
            console.error(error)
        })
    }

    return (
        <LeaderboardContext.Provider value={{ columns, data, isLoading, setIsLoading, selectedUserId, setSelectedUserId }}>
            {children}
        </LeaderboardContext.Provider>
    )

}