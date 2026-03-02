"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { CollectionsTable } from "@/components/admin/CollectionsTable";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export type ApiCollectionResponse = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    audience?: string | null;
    isFeatured?: boolean | null;
    displayOrder?: number | null;
    coverImageUrl?: string | null;
    createdAt?: string;
};

export default function AdminCollectionsPage() {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<ApiCollectionResponse | null>(null);

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
            />

            <CollectionForm
                open={isFormOpen}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                collection={editingCollection}
            />
        </div>
    );
}
