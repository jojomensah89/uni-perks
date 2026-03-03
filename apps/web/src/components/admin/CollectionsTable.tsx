"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, ListPlus } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import type { ApiCollectionResponse } from "@/app/admin/collections/page";
import Link from "next/link";

interface CollectionsTableProps {
    data: ApiCollectionResponse[];
    onEdit: (collection: ApiCollectionResponse) => void;
    onManageDeals: (collection: ApiCollectionResponse) => void;
}

export function CollectionsTable({ data, onEdit, onManageDeals }: CollectionsTableProps) {
    const queryClient = useQueryClient();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => fetchAPI(`/api/admin/collections/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_collections"] });
            setDeletingId(null);
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this collection? This will remove all deal associations.")) {
            setDeletingId(id);
            deleteMutation.mutate(id);
        }
    };

    if (data.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No collections found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Create your first collection to organize deals.
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((collection) => (
                        <TableRow key={collection.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {collection.coverImageUrl && (
                                        <img
                                            src={collection.coverImageUrl}
                                            alt={collection.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{collection.name}</p>
                                        {collection.description && (
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {collection.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {collection.slug}
                                </code>
                            </TableCell>
                            <TableCell>
                                {collection.audience && (
                                    <Badge variant="outline">{collection.audience}</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {collection.isFeatured ? (
                                    <Badge>Featured</Badge>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {collection.displayOrder ?? "-"}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-md">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Link href={`/collections/${collection.slug}` as any} className="flex items-center">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(collection)}>
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onManageDeals(collection)}>
                                            <ListPlus className="w-4 h-4 mr-2" />
                                            Manage Deals
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(collection.id)}
                                            className="text-destructive"
                                            disabled={deletingId === collection.id}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
