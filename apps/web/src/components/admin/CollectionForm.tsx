"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { fetchAPI } from "@/lib/api";
import type { ApiCollectionResponse } from "@/app/admin/collections/page";

interface CollectionFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    collection: ApiCollectionResponse | null;
}

export function CollectionForm({ open, onClose, onSuccess, collection }: CollectionFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        audience: "",
        isFeatured: false,
        displayOrder: 0,
        coverImageUrl: "",
        icon: "",
    });

    const [prevCollectionId, setPrevCollectionId] = useState(collection?.id);

    if (collection?.id !== prevCollectionId) {
        setPrevCollectionId(collection?.id);
        if (collection) {
            setFormData({
                name: collection.name,
                slug: collection.slug,
                description: collection.description || "",
                audience: collection.audience || "",
                isFeatured: collection.isFeatured ?? false,
                displayOrder: collection.displayOrder ?? 0,
                coverImageUrl: collection.coverImageUrl || "",
                icon: collection.icon || "",
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                description: "",
                audience: "",
                isFeatured: false,
                displayOrder: 0,
                coverImageUrl: "",
                icon: "",
            });
        }
    }

    const createMutation = useMutation({
        mutationFn: (data: typeof formData) =>
            fetchAPI("/api/admin/collections", {
                method: "POST",
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminCollections"] });
            onSuccess();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) =>
            fetchAPI(`/api/admin/collections/${collection?.id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminCollections"] });
            onSuccess();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (collection) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const generateSlug = () => {
        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
        setFormData({ ...formData, slug });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {collection ? "Edit Collection" : "Create Collection"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Student Essentials"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <div className="flex gap-2">
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="e.g., student-essentials"
                                required
                            />
                            <Button type="button" variant="outline" onClick={generateSlug}>
                                Generate
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of this collection..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="audience">Audience</Label>
                        <Input
                            id="audience"
                            value={formData.audience}
                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                            placeholder="e.g., all, cs-students, designers"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                        <Input
                            id="coverImageUrl"
                            value={formData.coverImageUrl}
                            onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon">Icon</Label>
                        <Input
                            id="icon"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="e.g., 🎓 or icon key"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="displayOrder">Display Order</Label>
                        <Input
                            id="displayOrder"
                            type="number"
                            value={formData.displayOrder}
                            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="isFeatured">Featured Collection</Label>
                        <Switch
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending
                                ? "Saving..."
                                : collection
                                    ? "Update"
                                    : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
