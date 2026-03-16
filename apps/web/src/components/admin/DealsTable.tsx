"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { ApiDealResponse } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, LayoutGrid, Table2 } from "lucide-react";
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
import type { ApiBrandResponse } from "@/types/api";
import type { ApiCategoryResponse } from "@/types/api";
import { DealEditDialog } from "./DealEditDialog";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

function DealLogo({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
    if (logoUrl) {
        return (
            <img
                src={`${API_URL}/api/images/${logoUrl}`}
                alt={name}
                className="h-6 w-6 rounded object-contain bg-muted shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
        );
    }
    return (
        <span className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
            {name?.charAt(0)?.toUpperCase() || "?"}
        </span>
    );
}

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

function getDealsColumns(brands: ApiBrandResponse[], categories: ApiCategoryResponse[]): ColumnDef<ApiDealResponse>[] {
    return [
        {
            id: "image",
            header: "Image",
            cell: ({ row }) => {
                const deal = row.original.deal;
                const brand = row.original.brand;
                const imageUrl = deal.coverImageUrl || brand?.logoUrl;
                
                if (imageUrl) {
                    return (
                        <div className="h-10 w-16 relative rounded-md overflow-hidden bg-muted border border-border">
                            <img
                                src={`${API_URL}/api/images/${imageUrl}`}
                                alt={deal.title}
                                className="object-cover w-full h-full"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                        </div>
                    );
                }
                return (
                    <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
                        NO IMG
                    </div>
                );
            },
        },
        {
            accessorKey: "deal.title",
            header: "Title",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{row.original.deal.title}</span>
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
            cell: ({ row }) => <DealsTableActions row={row.original} brands={brands} categories={categories} />,
        },
    ];
}

// ---- Card view ----
function DealCard({ deal: row, brands, categories }: { deal: ApiDealResponse; brands: ApiBrandResponse[]; categories: ApiCategoryResponse[] }) {
    const deal = row.deal;
    const coverUrl = deal.coverImageUrl
        ? `${API_URL}/api/images/${deal.coverImageUrl}`
        : null;

    return (
        <div className="group relative flex flex-col rounded-xl border border-foreground/10 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Cover image */}
            <div className="h-32 bg-muted flex items-center justify-center overflow-hidden relative">
                {coverUrl ? (
                    <img src={coverUrl} alt={deal.title} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-muted-foreground text-xs">No image</span>
                )}
                {/* Action button – always visible on mobile, hover on desktop */}
                <div className="absolute top-2 right-2">
                    <DealsTableActions row={row} brands={brands} categories={categories} />
                </div>
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                    <DealLogo logoUrl={row.brand?.logoUrl} name={row.brand?.name || "?"} />
                    <span className="text-xs text-muted-foreground truncate">{row.brand?.name}</span>
                </div>
                <p className="font-semibold text-sm leading-snug line-clamp-2">{deal.title}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
                    <Badge variant="outline" className="font-mono text-xs border border-foreground/10">
                        {deal.discountLabel || `${deal.discountValue}${deal.discountType === "percentage" ? "%" : ""}`}
                    </Badge>
                    {deal.isFeatured && <Badge className="bg-primary text-xs">Featured</Badge>}
                    {deal.isActive
                        ? <Badge className="bg-green-600 text-xs">Active</Badge>
                        : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                </div>
            </div>
        </div>
    );
}

// ---- View toggle + combined component ----
const EMPTY_BRANDS: ApiBrandResponse[] = [];
const EMPTY_CATEGORIES: ApiCategoryResponse[] = [];

type ViewMode = "table" | "card";

export function DealsTable({ data, brands = EMPTY_BRANDS, categories = EMPTY_CATEGORIES }: { data: ApiDealResponse[]; brands?: ApiBrandResponse[]; categories?: ApiCategoryResponse[] }) {
    const [view, setView] = useState<ViewMode>("table");
    const columns = getDealsColumns(brands, categories);

    return (
        <div className="w-full space-y-3">
            {/* Toggle buttons */}
            <div className="flex justify-end">
                <div className="flex rounded-lg border overflow-hidden">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-none px-3 gap-1.5 ${view === "table" ? "bg-muted font-semibold" : ""}`}
                        onClick={() => setView("table")}
                    >
                        <Table2 className="h-4 w-4" />
                        Table
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-none px-3 gap-1.5 border-l ${view === "card" ? "bg-muted font-semibold" : ""}`}
                        onClick={() => setView("card")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Cards
                    </Button>
                </div>
            </div>

            {/* Views */}
            {view === "table" ? (
                <DataTable columns={columns} data={data} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {data.map((d) => (
                        <DealCard key={d.deal.id} deal={d} brands={brands} categories={categories} />
                    ))}
                    {data.length === 0 && (
                        <p className="col-span-full text-center text-muted-foreground py-12">No deals found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
