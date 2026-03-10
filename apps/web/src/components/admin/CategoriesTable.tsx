"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { ApiCategoryResponse } from "@/types/api";
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
import { CategoryEditDialog } from "./CategoryEditDialog";

function CategoriesTableActions({ row }: { row: ApiCategoryResponse }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetchAPI(`/api/admin/categories/${row.id}`, { method: "DELETE" });
            toast.success("Category deleted");
            queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
            router.refresh();
            setDeleting(false);
            setDeleteOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete category");
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
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <CategoryEditDialog open={editOpen} onOpenChange={setEditOpen} category={row} />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the <strong>{row.name}</strong> category. Any deals assigned to this category may be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

const columns: ColumnDef<ApiCategoryResponse>[] = [
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
        accessorKey: "icon",
        header: "Icon",
        cell: ({ row }) => <span>{row.original.icon || "-"}</span>,
    },
    {
        id: "actions",
        cell: ({ row }) => <CategoriesTableActions row={row.original} />,
    },
];

export function CategoriesTable({ data }: { data: ApiCategoryResponse[] }) {
    return (
        <div className="w-full">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
