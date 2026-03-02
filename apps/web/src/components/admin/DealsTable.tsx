"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { ApiDealResponse } from "@/app/admin/deals/page";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<ApiDealResponse>[] = [
    {
        accessorKey: "deal.title",
        header: "Title",
        cell: ({ row }) => {
            const deal = row.original.deal;
            return (
                <div>
                    <div className="font-medium">{deal.title}</div>
                    <div className="text-xs text-muted-foreground">{deal.slug}</div>
                </div>
            );
        },
    },
    {
        accessorKey: "brand.name",
        header: "Brand",
        cell: ({ row }) => {
            const brand = row.original.brand;
            return <span>{brand?.name || "-"}</span>;
        },
    },
    {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }) => {
            const category = row.original.category;
            return <span>{category?.name || "-"}</span>;
        },
    },
    {
        id: "discount",
        header: "Discount",
        cell: ({ row }) => {
            const deal = row.original.deal;
            return (
                <Badge variant="outline" className="font-mono">
                    {deal.discountLabel || `${deal.discountValue}${deal.discountType === 'percentage' ? '%' : ''}`}
                </Badge>
            );
        },
    },
    {
        id: "featured",
        header: "Featured",
        cell: ({ row }) => {
            const deal = row.original.deal;
            return deal.isFeatured ? (
                <Badge className="bg-primary">Featured</Badge>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const deal = row.original.deal;
            return deal.isActive ? (
                <Badge variant="default" className="bg-green-600">Active</Badge>
            ) : (
                <Badge variant="secondary">Inactive</Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const { deal } = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(deal.id)}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export function DealsTable({ data }: { data: ApiDealResponse[] }) {
    return (
        <div className="w-full">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
