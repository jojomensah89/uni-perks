"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { ApiBrandResponse } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fetchAPI } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BrandEditDialog } from "./BrandEditDialog";

function BrandsTableActions({ row }: { row: ApiBrandResponse }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const handleDeactivate = async () => {
        setDeleting(true);
        try {
            await fetchAPI(`/api/admin/brands/${row.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isVerified: false }),
            });
            toast.success("Brand deactivated");
            queryClient.invalidateQueries({ queryKey: ["admin_brands"] });
            router.refresh();
            setDeleting(false);
            setDeleteOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to deactivate brand");
            setDeleting(false);
            setDeleteOpen(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>{row.name}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Deactivate
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <BrandEditDialog open={editOpen} onOpenChange={setEditOpen} brand={row} />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Brand?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark <strong>{row.name}</strong> as unverified. You can re-activate it by editing the brand.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeactivate}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deactivating..." : "Deactivate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

const columns: ColumnDef<ApiBrandResponse>[] = [
    {
        id: "logo",
        header: "Logo",
        cell: ({ row }) => {
            const logoUrl = row.original.logoUrl;
            if (logoUrl) {
                return (
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden border border-border">
                        <img
                            src={`${API_URL}/api/images/${logoUrl}`}
                            alt={row.original.name}
                            className="h-full w-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    </div>
                );
            }
            return (
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
                    {row.original.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.name}</div>
            </div>
        ),
    },
    {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => row.original.website
            ? <a href={row.original.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate max-w-48 block">{row.original.website}</a>
            : <span className="text-muted-foreground">-</span>,
    },
    {
        id: "verified",
        header: "Verified",
        cell: ({ row }) => row.original.isVerified
            ? <Badge className="bg-green-600">Verified</Badge>
            : <Badge variant="secondary">Unverified</Badge>,
    },
    {
        id: "actions",
        cell: ({ row }) => <BrandsTableActions row={row.original} />,
    },
];

export function BrandsTable({ data }: { data: ApiBrandResponse[] }) {
    return (
        <div className="w-full">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
