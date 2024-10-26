import React, {useContext} from 'react';
import ReusableTable from './tables/base-table';
import {PageTitle} from "./title/page-title.tsx";
import {LeaderboardContext} from "../../providers/leaderboard/leaderboard-provider.tsx";
import {IPlayer} from "../../models/leaderboard.ts";


const TableExample: React.FC = () => {
    const {data, columns} = useContext(LeaderboardContext);
    return (
        <div className="container mx-auto mt-16 h-full">
            <PageTitle title="Leaderboard"/>
            <ReusableTable<IPlayer>
                data={data}
                columns={columns}
                enableSorting={true}
                enableDragAndDrop={true}
                enableColumnResize={true}
                rowColorCode={'#7c66dc'}
                headerClassName="text-gray-200 font-normal text-center p-4 bg-[#1c172b]"
                rowClassName="rounded-lg mb-2 transition-all duration-200 cursor-pointer text-white"
                cellClassName="py-4"
                tableBgColor=""
            />
        </div>
    );
};

export default TableExample;