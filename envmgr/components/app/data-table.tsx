'use client'

import React, { useEffect, useState, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, Info, Search, X } from 'lucide-react'
import type { ColumnDef, RowSelectionState, OnChangeFn } from '@tanstack/react-table'
import {
    flexRender,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table'

import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { usePagination } from '@/hooks/use-pagination'

interface SelectionAction {
    label: string
    icon?: ReactNode
    onClick: (selectedRows: any[]) => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

interface ButtonProps {
    text: string
    onClick: () => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]

    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    onPageChange: (page: number) => void

    searchValue?: string
    onSearchChange?: (value: string) => void
    searchPlaceholder?: string

    // Selection props
    rowSelection?: RowSelectionState
    onRowSelectionChange?: OnChangeFn<RowSelectionState>
    selectionActions?: SelectionAction[]

    showPagination?: boolean
    emptyMessage?: string
    paginationItemsToDisplay?: number
    loading?: boolean,
    title?: string
    infoMessage?: string
    headerActions?: ReactNode
    filters?: ReactNode
    onRowClick?: (row: TData) => void,
    className?: string
    hideHeader?: boolean,
    button?: ButtonProps | ReactNode,
}

export function DataTable<TData, TValue>({
    columns,
    data,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    onPageChange,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
    rowSelection = {},
    onRowSelectionChange,
    selectionActions = [],
    showPagination = true,
    emptyMessage = 'No results.',
    paginationItemsToDisplay = 5,
    loading = false,
    title,
    infoMessage,
    headerActions,
    filters,
    onRowClick,
    className,
    hideHeader = false,
    button
}: DataTableProps<TData, TValue>) {
    const [innerSearchValue, setInnerSearchValue] = useState(searchValue)
    const inputRef = useRef<HTMLInputElement>(null)


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && 
                document.activeElement?.tagName !== 'INPUT' && 
                document.activeElement?.tagName !== 'TEXTAREA' &&
                !document.activeElement?.hasAttribute('contenteditable')) {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        setInnerSearchValue(searchValue)
    }, [searchValue])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (innerSearchValue !== searchValue) {
                onSearchChange?.(innerSearchValue)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [innerSearchValue, onSearchChange, searchValue])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
        state: {
            rowSelection
        },
        onRowSelectionChange,
        enableRowSelection: true,
    })

    const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
        currentPage,
        totalPages,
        paginationItemsToDisplay
    })

    const selectedRowsCount = Object.keys(rowSelection).length
    const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)

    return (
        <div className={`flex-1 space-y-4`}>
            <div className={cn('table-container relative bg-background w-full rounded-xl px-6', (!hideHeader && (filters || onSearchChange || headerActions || button)) ? 'mt-8' : "", className)}>
                {!hideHeader && < div className='flex items-center justify-between'>
                    {title && <h3 className='card-title'>{title}</h3>}
                    <div className={cn('flex justify-between gap-3 w-full', filters ? 'justify-between' : "justify-end", (filters || onSearchChange || headerActions || button) ? 'mb-5' : '')}>
                        {filters && filters}
                        {(headerActions || onSearchChange) && <div className='flex flex-1 justify-end gap-3 items-center'>
                            {headerActions}
                            {onSearchChange && (
                                <div className='flex items-center justify-end gap-5'>
                                    <div className='relative flex-1 w-72'>
                                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                                        <Input
                                            ref={inputRef}
                                            placeholder={searchPlaceholder}
                                            value={innerSearchValue}
                                            onChange={(e) => setInnerSearchValue(e.target.value)}
                                            className='pl-9 pr-12 h-11 rounded-md w-full'
                                        />
                                        <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none'>
                                            {innerSearchValue ? (
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-7 w-7 p-0 pointer-events-auto'
                                                    onClick={() => {
                                                        setInnerSearchValue('')
                                                        onSearchChange?.('')
                                                    }}
                                                >
                                                    <X className='h-4 w-4 text-muted-foreground' />
                                                </Button>
                                            ) : (
                                                <kbd className='hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100'>
                                                    /
                                                </kbd>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            )}
                            {button && (
                                React.isValidElement(button) ? button : (
                                    <Button
                                        className='min-w-[120px]'
                                        onClick={(button as ButtonProps).onClick}
                                        size={"default"}
                                        variant={(button as ButtonProps).variant}
                                    >
                                        {(button as ButtonProps).text}
                                    </Button>
                                )
                            )}
                        </div>}
                    </div>
                </div>}
                {infoMessage && (
                    <div className='mb-6 flex gap-2 items-center text-sm py-3 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 mt-4 font-medium text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'>
                        <Info size={16} className="shrink-0" />
                        {infoMessage}
                    </div>
                )}
                <div className='border border-border dark:border-border rounded-lg overflow-hidden max-h-[calc(100vh-20rem)] overflow-y-auto'>
                    <Table className=''>
                        <TableHeader className='bg-muted/50 dark:bg-muted/30 sticky top-0 z-10'>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id} className='hover:bg-transparent rounded-lg'>
                                    {headerGroup.headers.map((header, idx) => {
                                        return (
                                            <TableHead key={header.id} style={{ width: header.id == "select" ? "50px" : `${header.getSize()}px` }} className='h-14 px-6 uppercase'>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        {loading ? <TableBody>
                            {Array.from({ length: pageSize }, (_, rowIndex) => {
                                const headerGroup = table.getHeaderGroups()[0];
                                return (
                                    <TableRow key={rowIndex}>
                                        {headerGroup.headers.map((header) => (
                                            <TableCell key={header.id} className='px-6 py-0 h-14'>
                                                <Skeleton
                                                    style={{ width: header.id == "select" ? "50px" : "100px" }}
                                                    className='h-5 rounded'
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody> : <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map(row => (
                                    <TableRow
                                        key={row.id + Math.random()}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className={cn(
                                            'hover:bg-muted/50 dark:hover:bg-muted/10 transition-colors border-b border-border dark:border-border last:border-0',
                                            onRowClick && 'cursor-pointer'
                                        )}
                                        onClick={() => onRowClick?.(row.original)}
                                    >
                                        {row.getVisibleCells().map(cell => {
                                            return (
                                                <TableCell className='text-sm text-table dark:text-table px-6 h-14' key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>}
                    </Table>
                </div>


                {/* Floating Selection Bar */}
                {selectedRowsCount > 0 && selectionActions.length > 0 && (
                    <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300'>
                        <div className='bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground rounded-lg shadow-lg dark:shadow-2xl border border-primary/20 dark:border-primary/40 px-4 py-3 flex items-center gap-4'>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm font-medium'>
                                    {selectedRowsCount} {selectedRowsCount === 1 ? 'item' : 'items'} selected
                                </span>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 w-6 p-0 hover:bg-primary-foreground/20 dark:hover:bg-primary-foreground/30'
                                    onClick={() => table.resetRowSelection()}
                                >
                                    <X className='h-4 w-4' />
                                </Button>
                            </div>

                            <div className='h-6 w-px bg-primary-foreground/20 dark:bg-primary-foreground/30' />

                            <div className='flex items-center gap-2'>
                                {selectionActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant={action.variant || 'secondary'}
                                        size='sm'
                                        className='h-8 gap-2'
                                        onClick={() => action.onClick(selectedRows)}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {showPagination && (
                    <div className='flex items-center justify-between gap-3 max-sm:flex-col pt-6'>
                        <p className='text-muted-foreground dark:text-muted-foreground font-medium flex-1 text-sm whitespace-nowrap' aria-live='polite'>
                            Total {totalCount} {totalCount === 1 ? 'result' : 'results'}
                        </p>

                        <div className='flex-1 flex justify-end'>
                            <Pagination className='flex justify-end'>
                                <PaginationContent>
                                    <PaginationItem className='mr-1'>
                                        <Button
                                            size='icon'
                                            variant='outline'
                                            className='border border-border dark:border-border bg-background dark:bg-background hover:bg-muted dark:hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
                                            onClick={() => loading ? null : onPageChange(currentPage - 1)}
                                            disabled={currentPage <= 1}
                                            aria-label='Go to previous page'
                                        >
                                            <ChevronLeftIcon size={16} aria-hidden='true' />
                                        </Button>
                                    </PaginationItem>

                                    {showLeftEllipsis && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    {pages.map((page: number) => {
                                        const isActive = page === currentPage

                                        return (
                                            <PaginationItem key={page}>
                                                <Button
                                                    size='icon'
                                                    variant={`${isActive ? 'default' : 'ghost'}`}
                                                    className={cn(
                                                        'border bg-background dark:bg-background hover:bg-muted dark:hover:bg-muted text-foreground dark:text-foreground',
                                                        isActive ? 'bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground border-primary dark:border-primary hover:bg-primary/90 dark:hover:bg-primary/90' : 'border-border dark:border-border'
                                                    )}
                                                    onClick={() => loading ? null : onPageChange(page)}
                                                    aria-current={isActive ? 'page' : undefined}
                                                >
                                                    {page}
                                                </Button>
                                            </PaginationItem>
                                        )
                                    })}

                                    {showRightEllipsis && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    <PaginationItem className='ml-1'>
                                        <Button
                                            size='icon'
                                            variant='outline'
                                            className='border border-border dark:border-border bg-background dark:bg-background hover:bg-muted dark:hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
                                            onClick={() => loading ? null : onPageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages}
                                            aria-label='Go to next page'
                                        >
                                            <ChevronRightIcon size={16} aria-hidden='true' />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}