import {FC} from "react";

interface IPageTitleProps {
    title: string
}

export const PageTitle:FC<IPageTitleProps> = ( {title}) => {

    return (
        <>
            <div className={'flex flex-row w-full h-36 justify-center items-center'}>
                <h1 className={'text:3xl md:text-4xl text- dark:text-white font-press-start'}>{title}</h1>
            </div>
            <div>
                <div className="absolute top-0 z-10> left-0 w-full h-full">
                    <div
                        className="bg-title-bg-light dark:bg-title-bg-dark opacity-30 rounded-b-full h-full w-full transform -translate-y-1/2"></div>
                </div>
            </div>
        </>
    )
};