"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchAPI } from "@/lib/api";
import type { ApiCategoryResponse } from "@/types/api";
import { ImageUpload } from "./ImageUpload";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

interface CategoryEditDialogProps {
    category: ApiCategoryResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CategoryEditDialog({ category, open, onOpenChange }: CategoryEditDialogProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const updateCategoryMutation = useMutation({
        mutationFn: async (data: any) => {
            return fetchAPI(`/api/admin/categories/${category.id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });
        },
    });

    const form = useForm({
        defaultValues: {
            name: category.name || "",
            slug: category.slug || "",
            icon: category.icon || "",
            coverImageUrl: category.coverImageUrl || "",
        },
        onSubmit: async ({ value }) => {
            try {
                let finalCoverImageUrl = value.coverImageUrl;

                if (pendingFile) {
                    const uploadData = new FormData();
                    uploadData.append("file", pendingFile);
                    uploadData.append("folder", "categories");
                    const uploadRes = await fetch(`${API_URL}/api/upload`, {
                        method: "POST",
                        body: uploadData,
                        credentials: "include",
                    });
                    
                    if (!uploadRes.ok) {
                        throw new Error("Failed to upload image");
                    }
                    const resJson = await uploadRes.json() as { key: string };
                    finalCoverImageUrl = resJson.key;
                }

                const finalData = { ...value, coverImageUrl: finalCoverImageUrl };
                await updateCategoryMutation.mutateAsync(finalData);

                toast.success("Category updated!");
                setPendingFile(null);
                queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
                onOpenChange(false);
            } catch (error: any) {
                toast.error(error.message || "Failed to update category");
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>Update category information for "{category.name}"</DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
                    className="py-4 grid gap-4"
                >
                    <form.Field name="name" validators={{ onChange: ({ value }) => !value?.trim() ? "Required" : undefined }}>
                        {(field) => (
                            <div className="grid gap-2">
                                <Label>Name *</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="slug" validators={{ onChange: ({ value }) => !value?.trim() ? "Required" : undefined }}>
                        {(field) => (
                            <div className="grid gap-2">
                                <Label>Slug *</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="icon">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label>Icon (emoji or text)</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g. 🎓 or tech" />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="coverImageUrl">
                        {(field) => (
                            <ImageUpload
                                label="Cover Image"
                                value={field.state.value}
                                onChange={(key) => field.handleChange(key)}
                                onFileSelected={(file) => setPendingFile(file)}
                                folder="categories"
                            />
                        )}
                    </form.Field>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </Button>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
