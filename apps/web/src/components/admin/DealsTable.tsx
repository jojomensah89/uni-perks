"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { ApiDealResponse } from "@/app/admin/deals/page";
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
import type { ApiBrandResponse } from "@/app/admin/brands/page";
import type { ApiCategoryResponse } from "@/app/admin/categories/page";
import { DealEditDialog } from "./DealEditDialog";

function DealsTableActions({ row, brands, categories }: { row: ApiDealResponse; brands: ApiBrandResponse[]; categories: ApiCategoryResponse[] }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetchAPI(`/api/admin/deals/${row.deal.id}`, { method: "DELETE" });
            toast.success("Deal deactivated successfully");
            queryClient.invalidateQueries({ queryKey: ["admin_deals"] });
            router.refresh();
            setDeleting(false);
            setDeleteOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete deal");
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
                        <DropdownMenuLabel>{row.deal.title}</DropdownMenuLabel>
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

            {/* Edit Dialog */}
            <DealEditDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                deal={row}
                brands={brands}
                categories={categories}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Deal?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deactivate <strong>{row.deal.title}</strong> and hide it from students. You can re-activate it later by editing the deal.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
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

export function getDealsColumns(): ColumnDef<ApiDealResponse>[] {
    return [
        {
            accessorKey: "deal.title",
            header: "Title",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.deal.title}</div>
                </div>
            ),
        },
        {
            accessorKey: "brand.name",
            header: "Brand",
            cell: ({ row }) => <span>{row.original.brand?.name || "-"}</span>,
        },
        {
            accessorKey: "category.name",
            header: "Category",
            cell: ({ row }) => <span>{row.original.category?.name || "-"}</span>,
        },
        {
            id: "discount",
            header: "Discount",
            cell: ({ row }) => {
                const deal = row.original.deal;
                return (
                    <Badge variant="outline" className="font-mono">
                        {deal.discountLabel || `${deal.discountValue}${deal.discountType === "percentage" ? "%" : ""}`}
                    </Badge>
                );
            },
        },
        {
            id: "featured",
            header: "Featured",
            cell: ({ row }) => row.original.deal.isFeatured
                ? <Badge className="bg-primary">Featured</Badge>
                : <span className="text-muted-foreground">-</span>,
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => row.original.deal.isActive
                ? <Badge variant="default" className="bg-green-600">Active</Badge>
                : <Badge variant="secondary">Inactive</Badge>,
        },
        {
            id: "actions",
            cell: ({ row }) => <DealsTableActions row={row.original} brands={[]} categories={[]} />,
        },
    ];
}

const EMPTY_BRANDS: ApiBrandResponse[] = [];
const EMPTY_CATEGORIES: ApiCategoryResponse[] = [];

export function DealsTable({ data, brands = EMPTY_BRANDS, categories = EMPTY_CATEGORIES }: { data: ApiDealResponse[]; brands?: ApiBrandResponse[]; categories?: ApiCategoryResponse[] }) {
    const columns = getDealsColumns();
    return (
        <div className="w-full">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
