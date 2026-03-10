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

interface CategoryEditDialogProps {
    category: ApiCategoryResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CategoryEditDialog({ category, open, onOpenChange }: CategoryEditDialogProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

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
        },
        onSubmit: async ({ value }) => {
            try {
                await updateCategoryMutation.mutateAsync(value);

                toast.success("Category updated!");
                queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
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
