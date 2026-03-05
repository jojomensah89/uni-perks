"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    defaultPageSize?: number;
}

function buildPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    pages.push(1);

    if (currentPage <= 4) {
        pages.push(2, 3, 4, 5, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 3) {
        pages.push("ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
        pages.push("ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    }

    return pages;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    defaultPageSize = 10,
}: DataTableProps<TData, TValue>) {
    const [prevDefaultSize, setPrevDefaultSize] = useState(defaultPageSize);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [pageIndex, setPageIndex] = useState(0);

    if (defaultPageSize !== prevDefaultSize) {
        setPrevDefaultSize(defaultPageSize);
        setPageSize(defaultPageSize);
    }

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        onPaginationChange: (updater) => {
            const next = typeof updater === "function"
                ? updater({ pageIndex, pageSize })
                : updater;
            setPageIndex(next.pageIndex);
            setPageSize(next.pageSize);
        },
        manualPagination: false,
    });

    const currentPage = pageIndex + 1;
    const totalPages = table.getPageCount();
    const totalRows = data.length;
    const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

    const pageNumbers = buildPageNumbers(currentPage, totalPages);

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-border">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer: results info + page size selector + pagination */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Results info + row count */}
                <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                        {totalRows === 0
                            ? "No results"
                            : `Showing ${startRow}–${endRow} of ${totalRows} results`}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows:</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(val) => {
                                const newSize = Number(val);
                                setPageSize(newSize);
                                setPageIndex(0);
                            }}
                        >
                            <SelectTrigger className="h-8 w-16 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 50, 100].map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                                    aria-disabled={pageIndex === 0}
                                    className={pageIndex === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {pageNumbers.map((page, idx) =>
                                page === "ellipsis" ? (
                                    <PaginationItem key={`ellipsis-${idx < 5 ? "start" : "end"}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            isActive={page === currentPage}
                                            onClick={() => setPageIndex(() => page - 1)}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                                    aria-disabled={pageIndex >= totalPages - 1}
                                    className={pageIndex >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    );
}
