import {Layers} from "lucide-react";
import {FC} from "react";

interface ICountryFilterProps {
    toggleGroupView: () => void;
    isGroupView: boolean;
}

export const CountryFilter:FC<ICountryFilterProps> = ({ isGroupView, toggleGroupView }) => {
    return (
        <div onClick={toggleGroupView} className={'w-11 h-11 bg-white dark:bg-[#1c172b] border border-gray-200 dark:border-purple-600 rounded-lg flex flex-row justify-center items-center cursor-pointer z-50'}>
            <Layers className={`h-6 w-6 ${isGroupView ? 'text-purple-600 dark:text-purple-500' : 'text-black dark:text-gray-100'}`} />
        </div>
    )
}