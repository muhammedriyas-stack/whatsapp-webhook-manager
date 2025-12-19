"use client";

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

import { ReactNode } from "react";

export interface Column<T> {
    header: string;
    cell: (row: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;

    total?: number;
    page?: number;
    limit?: number;
    onPageChange?: (page: number) => void;
}

export function DataTable<T>({
    data,
    columns,
    loading,
    total = 0,
    page = 0,
    limit = 10,
    onPageChange,
}: DataTableProps<T>) {
    const totalPages = Math.ceil(total / limit);

    if (loading) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No data found.
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col, i) => (
                                <TableHead key={i}>{col.header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <TableCell
                                        key={colIndex}
                                        className={col.className}
                                    >
                                        {col.cell(row)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {onPageChange && totalPages > 1 && (
                <Pagination className="py-4">
                    <PaginationContent>

                        {/* Previous */}
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 0) onPageChange(page - 1);
                                }}
                                className={page === 0 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {/* First page always visible */}
                        <PaginationItem>
                            <PaginationLink
                                href="#"
                                isActive={page === 0}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(0);
                                }}
                            >
                                1
                            </PaginationLink>
                        </PaginationItem>

                        {/* Left Ellipsis */}
                        {page > 2 && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}

                        {/* Dynamic middle pages */}
                        {Array.from({ length: totalPages })
                            .map((_, i) => i)
                            .filter((i) => i >= page - 1 && i <= page + 1) // show only 3 pages
                            .filter((i) => i !== 0 && i !== totalPages - 1) // avoid duplicate first/last
                            .map((i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href="#"
                                        isActive={page === i}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPageChange(i);
                                        }}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                        {/* Right Ellipsis */}
                        {page < totalPages - 3 && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}

                        {/* Last page always visible */}
                        {totalPages > 1 && (
                            <PaginationItem>
                                <PaginationLink
                                    href="#"
                                    isActive={page === totalPages - 1}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(totalPages - 1);
                                    }}
                                >
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        {/* Next */}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < totalPages - 1) onPageChange(page + 1);
                                }}
                                className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                    </PaginationContent>
                </Pagination>
            )}
        </>
    );
}
