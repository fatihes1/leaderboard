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
    rowColorCode?: string;
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
    tableBgColor?: string;
}

function ReusableTable<T extends { id: number | string }>({
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
                                                              tableBgColor = 'bg-[#1a1b2e]',
                                                              rowColorCode = '#251e40',
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
        <div className={`w-full h-1/3 z-50 ${tableBgColor} p-8 rounded-lg mt-10 ${className}`}>
            <div className="h-full relative">
                {/* Table wrapper */}
                <div className="max-h-[55vh] scroll-area overflow-x-auto">
                    <table className={`w-full border-separate border-spacing-y-2 min-w-[${minTableWidth}]`}>
                        {/* Sticky Header */}
                        <thead className="sticky top-0 z-10 bg-inherit">
                        <tr>
                            {table.getHeaderGroups().map(headerGroup => (
                                <React.Fragment key={headerGroup.id}>
                                    {headerGroup.headers.map((header, headerIndex) => (
                                        <th
                                            key={header.id}
                                            className={`${headerClassName} ${enableDragAndDrop ? 'cursor-move' : ''}`}
                                            onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                                            style={{
                                                paddingLeft: headerIndex === 0 ? '2rem' : '',
                                            }}
                                        >
                                            <div
                                                className={`flex items-center gap-2 ${enableDragAndDrop ? 'draggable-column hover:cursor-move' : ''}`}
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
                        {/* Scrollable Body */}
                        <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className={rowClassName}>
                                {row.getVisibleCells().map((cell, cellIndex) => (
                                    <td key={cell.id} className={cellClassName} style={{padding: 0}}>
                                        <div
                                            style={{
                                                borderRadius: cellIndex === 0 ? '2rem 0 0 1rem' : cellIndex === row.getVisibleCells().length - 1 ? '0 1rem 2rem 0' : '0',
                                                paddingLeft: cellIndex === 0 ? '3rem' : '',
                                                padding: '1rem',
                                                backgroundColor: rowColorCode,
                                            }}
                                            className="text-sm"
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

export default ReusableTable;