import {LeaderboardContext, LeaderboardProvider} from "../providers/leaderboard/leaderboard-provider.tsx";
import  {useContext} from "react";
import {PageTitle} from "@/components/ui/title/page-title.tsx";
import {PlayerFilter} from "@/components/ui/filters/player-filter.tsx";
import ReusableTable from "@/components/ui/tables/base-table.tsx";
import {IPlayer} from "@/models/leaderboard.ts";
import {CountryFilter} from "@/components/ui/filters/country-filter.tsx";


const LeaderboardWrapper = () => {
    const {data, columns, groupedData, groupedColumns, isGroupView, toggleGroupView} = useContext(LeaderboardContext);

    const renderPlayerSubTable = (players: IPlayer[]) => {
        return (
                <div className={'z-40'}>
                    <ReusableTable
                        data={players}
                        columns={groupedColumns}
                        enableSorting={true}
                        enableDragAndDrop={true}
                        enableColumnResize={true}
                        headerClassName="text-black dark:text-gray-100 font-normal text-center p-4 bg-white dark:bg-[#1c172b]"
                        rowClassName="rounded-lg mb-2 transition-all duration-200 cursor-pointer text-white"
                        cellClassName="py-4"
                    />
                </div>
        );
    };

    return (
        <div className={'container mx-auto mt-16 h-full'}>
            <PageTitle
                title="Leaderboard"
            />
            <div className={'flex flex-row md:mx-0 justify-center items-center gap-x-2 md:gap-x-6'}>
                <div className={'w-8/12 md:w-11/12 z-50'}>
                    <PlayerFilter />
                </div>
                <div className={'w-1/12 z-50'}>
                    <CountryFilter  isGroupView={isGroupView} toggleGroupView={toggleGroupView}/>
                </div>
            </div>
            {
                isGroupView ? (
                    <div className="relative max-h-[60vh] overflow-y-scroll scroll-area mt-5 z-40 container">
                        {groupedData.map((group, index) => (
                            <div key={`${group.country.name}-${index}`} className="flex flex-col w-full rounded-lg container overflow-hidden z-40">
                                <div className={'flex flex-row justify-center items-center z-40'}>
                                    <div className={'flex flex-row justify-center items-center w-full mx-2 h-14 bg-white border border-gray-400 rounded-lg text-xl font-medium dark:bg-[#1c172b] dark:border-purple-600 dark:text-gray-200'}>
                                        <img src={group.country.flag} alt={group.country.name} className="w-4 h-4 mr-2 md:w-6 md:h-6 rounded-full object-fit"/>
                                        {group.country.name}
                                    </div>
                                </div>
                                    {renderPlayerSubTable(group.players)}
                            </div>
                        ))}
                    </div>
                ) : (
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
                )
            }
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