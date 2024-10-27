import React, {ReactElement, useState} from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getExpandedRowModel,
    ColumnDef,
    getSortedRowModel,
    SortingState,
    ColumnOrderState,
} from '@tanstack/react-table';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {ArrowDown, ArrowUp, ArrowUpDown, GripVertical} from "lucide-react";

export type TableColumn<T> = ColumnDef<T> & {
    id: string;
    header: string;
    accessorKey: string;
};

export interface BaseTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    rowColorClass?: string;
    initialColumnOrder?: string[];
    onOrderChange?: (newOrder: string[]) => void;
    className?: string;
    enableSorting?: boolean;
    enableColumnResize?: boolean;
    enableDragAndDrop?: boolean;
    minTableWidth?: string;
    rowClassName?: string;
    headerClassName?: string;
    cellClassName?: string;
    maxTableHeightClass?: string;
}

function BaseTable<T extends { id: number | string }>({
                                                              data,
                                                              columns,
                                                              initialColumnOrder,
                                                              onOrderChange,
                                                              className = '',
                                                              enableSorting = true,
                                                              enableColumnResize = true,
                                                              enableDragAndDrop = true,
                                                              minTableWidth = '600px',
                                                              rowClassName = 'bg-[#2a2b3e] mb-2 rounded-lg hover:bg-[#3a3b4e] transition-colors',
                                                              headerClassName = 'text-left p-4 text-gray-400 font-normal',
                                                              cellClassName = 'p-4 text-white',
                                                              rowColorClass = 'bg-white dark:bg-[#1c172b]',
                                                              maxTableHeightClass = 'max-h-[58vh]',
                                                          }: BaseTableProps<T>): ReactElement {
    const defaultColumnOrder = initialColumnOrder || columns.map(col => col.id);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder);
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable<T>({
        data,
        columns,
        state: {
            columnOrder,
            sorting,
        },
        onColumnOrderChange: (updater) => {
            const newOrder = typeof updater === 'function'
                ? updater(columnOrder)
                : updater;
            setColumnOrder(newOrder);
            onOrderChange?.(newOrder);
        },
        onSortingChange: (updater) => {
            setSorting(typeof updater === 'function' ? updater(sorting) : updater);
        },
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        columnResizeMode: 'onChange',
        enableColumnResizing: enableColumnResize,
    });

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
        e.dataTransfer.setData('text/plain', columnId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('text/plain');
        const newColumnOrder = [...columnOrder];
        const sourceIndex = newColumnOrder.indexOf(sourceId);
        const targetIndex = newColumnOrder.indexOf(targetColumnId);
        newColumnOrder.splice(sourceIndex, 1);
        newColumnOrder.splice(targetIndex, 0, sourceId);
        setColumnOrder(newColumnOrder);
        onOrderChange?.(newColumnOrder);
    };

    const tableContent = (
        <div className={`w-full h-1/3 z-50 p-3 rounded-lg ${className}`}>
            <div className="h-full relative">
                {/* Table wrapper */}
                <div className={`${maxTableHeightClass} scroll-area overflow-x-auto`}>
                    <table className={`w-full border-separate border-spacing-y-2 min-w-[${minTableWidth}]`}>
                        {/* Sticky Header */}
                        <thead className="sticky top-0 z-10">
                        <tr>
                            {table.getHeaderGroups().map(headerGroup => (
                                <React.Fragment key={headerGroup.id}>
                                    {headerGroup.headers.map((header, headerIndex) => (
                                        <th
                                            key={header.id}
                                            className={`border-y border-gray-300 dark:border-purple-600 
                                            ${headerIndex === 0 ? 'rounded-l-lg border-l border-gray-300 dark:border-purple-600' : ''} 
                                            ${headerIndex === headerGroup.headers.length - 1 ? 'border-r border-gray-300 dark:border-purple-600 mr-2 rounded-r-lg' : ''}
                                            ${headerClassName} 
                                            ${enableDragAndDrop ? 'cursor-move' : ''}`}
                                            onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                                            style={{
                                                paddingLeft: headerIndex === 0 ? '2rem' : '',
                                            }}
                                        >
                                            <div
                                                className={`flex text-sm md:text-base items-center gap-2 ${enableDragAndDrop ? 'draggable-column hover:cursor-move' : ''}`}
                                                draggable={enableDragAndDrop}
                                                onDragStart={enableDragAndDrop ? (e) => handleDragStart(e, header.id) : undefined}
                                                onDragOver={enableDragAndDrop ? handleDragOver : undefined}
                                                onDrop={enableDragAndDrop ? (e) => handleDrop(e, header.id) : undefined}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {
                                                    enableDragAndDrop && (
                                                        <GripVertical size={16} />
                                                    )
                                                }
                                                {enableSorting && (
                                                    <span>
                                                            {!header.column.getIsSorted() && <ArrowUpDown size={16} />}
                                                        {header.column.getIsSorted() === 'asc' && <ArrowUp size={16} />}
                                                        {header.column.getIsSorted() === 'desc' && <ArrowDown size={16} />}
                                                        </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className={`${rowClassName} z-50`} data-row-id={row.original.id}>
                                {row.getVisibleCells().map((cell, cellIndex) => (
                                    <td key={cell.id} className={cellClassName} style={{padding: 0}}>
                                        <div
                                            className={`
                                            text-sm md:text-base
                                            text-black dark:text-white
                                            border-y border-gray-300 dark:border-purple-900
                                            p-4
                                            ${cellIndex === 0 ? 'pl-12 rounded-tl-[2rem] rounded-bl-[1rem]' : ''}
                                            ${cellIndex === row.getVisibleCells().length - 1 ? 'rounded-br-[2rem] rounded-tr-[1rem]' : ''}
                                            ${rowColorClass}`}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return enableDragAndDrop ? (
        <DndProvider backend={HTML5Backend}>
            {tableContent}
        </DndProvider>
    ) : tableContent;
}

export default BaseTable;