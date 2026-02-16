"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { ColumnDef } from '@tanstack/react-table'

interface ServiceResponse<T> {
    data: T[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

interface ServiceTableProps<T> {
    fetcher: (
        params: { page: number; limit: number; search: string },
        callbacks: {
            onLoading: (loading: boolean) => void;
            onSuccess: (response: ServiceResponse<T>) => void;
            onError: (message: string) => void;
        }
    ) => void;
    columns: ColumnDef<T, any>[];
    searchPlaceholder?: string;
    emptyMessage?: string;
    title?: string;
    headerActions?: React.ReactNode;
    onRowClick?: (row: T) => void;
    className?: string;
    dependencies?: any[];
    button?: any;
}

export function ServiceTable<T>({
    fetcher,
    columns,
    searchPlaceholder,
    emptyMessage,
    title,
    headerActions,
    onRowClick,
    className,
    dependencies = [],
    button
}: ServiceTableProps<T>) {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(false)
    const [meta, setMeta] = useState({
        page: 1,
        totalPages: 1,
        totalCount: 0,
        search: "",
        limit: 10
    })

    const fetchData = () => {
        fetcher(
            { page: meta.page, limit: meta.limit, search: meta.search },
            {
                onLoading: setLoading,
                onSuccess: (response) => {
                    setData(response.data)
                    setMeta(prev => ({
                        ...prev,
                        totalPages: response.pagination.totalPages,
                        totalCount: response.pagination.total
                    }))
                },
                onError: (message) => {
                    console.error(message)
                }
            }
        )
    }

    useEffect(() => {
        fetchData()
    }, [meta.page, meta.search, meta.limit, ...dependencies])

    return (
        <DataTable
            className={className}
            columns={columns}
            data={data}
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalCount={meta.totalCount}
            pageSize={meta.limit}
            onPageChange={(page) => setMeta(prev => ({ ...prev, page }))}
            onSearchChange={(search) => setMeta(prev => ({ ...prev, search, page: 1 }))}
            searchValue={meta.search}
            loading={loading}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            title={title}
            headerActions={headerActions}
            onRowClick={onRowClick}
            button={button}
        />
    )
}
