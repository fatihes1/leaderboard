import {LeaderboardContext, LeaderboardProvider} from "../providers/leaderboard/leaderboard-provider.tsx";
import  {useContext} from "react";
import {PageTitle} from "@/components/ui/title/page-title.tsx";
import {PlayerFilter} from "@/components/ui/filters/player-filter.tsx";
import ReusableTable from "@/components/ui/tables/base-table.tsx";
import {IPlayer} from "@/models/leaderboard.ts";
import {CountryFilter} from "@/components/ui/filters/country-filter.tsx";


const LeaderboardWrapper = () => {
    const {data, columns} = useContext(LeaderboardContext);

    return (
        <div className={'container mx-auto mt-16 h-full'}>
            <PageTitle
                title="Leaderboard"
            />
            <div className={'flex flex-row md:mx-0 justify-center items-center gap-x-2 md:gap-x-6'}>
                <div className={'w-8/12 md:w-11/12'}>
                    <PlayerFilter />
                </div>
                <div className={'w-1/12'}>
                    <CountryFilter />
                </div>
            </div>
                <ReusableTable<IPlayer>
                    data={data}
                    columns={columns}
                    enableSorting={true}
                    enableDragAndDrop={true}
                    enableColumnResize={true}
                    headerClassName="text-black dark:text-gray-100 font-normal text-center p-4 bg-white dark:bg-[#1c172b]"
                    rowClassName="rounded-lg mb-2 transition-all duration-200 cursor-pointer text-white"
                    cellClassName="py-4"
                />
        </div>
    )
}

export const LeaderboardPage = () => {
    return (
        <LeaderboardProvider>
                <LeaderboardWrapper />
        </LeaderboardProvider>
    )
}