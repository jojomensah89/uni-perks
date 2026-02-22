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
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("title")}</div>
        ),
    },
    {
        accessorKey: "brand.name",
        header: "Brand",
    },
    {
        accessorKey: "category.name",
        header: "Category",
    },
    {
        accessorKey: "discountValue",
        header: "Discount",
        cell: ({ row }) => {
            const data = row.original;
            return <span>{data.discountValue} {data.discountType}</span>;
        }
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive") as boolean;
            return isActive ? (
                <Badge variant="default" className="bg-green-600">Active</Badge>
            ) : (
                <Badge variant="secondary">Inactive</Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const deal = row.original;

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
