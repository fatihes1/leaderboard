import {Layers} from "lucide-react";

export const CountryFilter = () => {
    return (
        <div className={'w-11 h-11 bg-white dark:bg-[#1c172b] border border-gray-200 dark:border-purple-600 rounded-lg flex flex-row justify-center items-center'}>
            <Layers className={'h-6 w-6 text-black dark:text-gray-100'} />
        </div>
    )
}