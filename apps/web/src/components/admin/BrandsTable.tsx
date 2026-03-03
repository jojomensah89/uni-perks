"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { ApiBrandResponse } from "@/app/admin/brands/page";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<ApiBrandResponse>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
            const website = row.getValue("website") as string;
            if (!website) return <span className="text-muted-foreground">-</span>;
            return (
                <a href={website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {website.replace(/^https?:\/\//, '')}
                </a>
            );
        },
    },
    {
        accessorKey: "isVerified",
        header: "Status",
        cell: ({ row }) => {
            const isVerified = row.getValue("isVerified") as boolean;
            return isVerified ? (
                <Badge variant="default" className="bg-green-600">Verified</Badge>
            ) : (
                <Badge variant="secondary">Unverified</Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const brand = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <div className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(brand.id)}
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
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export function BrandsTable({ data }: { data: ApiBrandResponse[] }) {
    return (
        <div className="w-full">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
