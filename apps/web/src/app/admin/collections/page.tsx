"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { CollectionsTable } from "@/components/admin/CollectionsTable";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { CollectionDealsManager } from "@/components/admin/CollectionDealsManager";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

export type ApiCollectionResponse = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    audience: string | null;
    coverImageUrl?: string | null;
    isFeatured: boolean;
    _count?: {
        deals: number;
    };
    icon?: string | null;
    createdAt?: string;
};

export default function AdminCollectionsPage() {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<ApiCollectionResponse | null>(null);
    const [isDealsManagerOpen, setIsDealsManagerOpen] = useState(false);
    const [managingDealsFor, setManagingDealsFor] = useState<ApiCollectionResponse | null>(null);

    const collectionsQuery = useQuery({
        queryKey: ["admin_collections"],
        queryFn: () => fetchAPI<{ collections: ApiCollectionResponse[] }>("/api/admin/collections"),
    });

    const isLoading = collectionsQuery.isLoading;
    const isError = collectionsQuery.isError;
    const collections = collectionsQuery.data?.collections || [];

    const handleEdit = (collection: ApiCollectionResponse) => {
        setEditingCollection(collection);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingCollection(null);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingCollection(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        queryClient.invalidateQueries({ queryKey: ["admin_collections"] });
    };

    const handleManageDeals = (collection: ApiCollectionResponse) => {
        setManagingDealsFor(collection);
        setIsDealsManagerOpen(true);
    };

    const handleDealsManagerClose = () => {
        setIsDealsManagerOpen(false);
        setManagingDealsFor(null);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading collections...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <p className="text-destructive font-semibold">Failed to load collections.</p>
                <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage curated collections of deals.
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className={buttonVariants()}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Collection
                </button>
            </div>

            <CollectionsTable
                data={collections}
                onEdit={handleEdit}
                onManageDeals={handleManageDeals}
            />

            <CollectionForm
                open={isFormOpen}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                collection={editingCollection}
            />

            <Sheet open={isDealsManagerOpen} onOpenChange={handleDealsManagerClose}>
                <SheetContent className="w-full sm:max-w-2xl p-0" side="right">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Manage Collection Deals</SheetTitle>
                    </SheetHeader>
                    {managingDealsFor && (
                        <CollectionDealsManager
                            collection={managingDealsFor}
                            onClose={handleDealsManagerClose}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
