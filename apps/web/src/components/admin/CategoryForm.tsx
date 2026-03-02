"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface CategoryFormProps {
    onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            name: "",
            slug: "",
            icon: "",
            color: "",
            coverImageUrl: "",
            displayOrder: 0,
            metaTitle: "",
            metaDescription: "",
        },
        onSubmit: async ({ value }) => {
            try {
                await fetchAPI("/api/admin/categories", {
                    method: "POST",
                    body: JSON.stringify(value),
                });

                toast.success("Category created successfully!");
                setOpen(false);
                form.reset();
                router.refresh();
                if (onSuccess) onSuccess();
            } catch (error: any) {
                toast.error(error.message || "Failed to create category");
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                        Create a new category for deals to be grouped under.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <form.Field
                            name="name"
                            listeners={{
                                onChange: ({ value }) => {
                                    if (value && !form.getFieldValue("slug")) {
                                        const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                        form.setFieldValue("slug", slug);
                                    }
                                }
                            }}
                            validators={{
                                onChange: ({ value }) => !value ? "Name is required" : undefined,
                            }}
                        >
                            {(field) => (
                                <div className="grid gap-2">
                                    <Label htmlFor={field.name}>Name *</Label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. Cloud Infrastructure"
                                    />
                                    {field.state.meta.errors ? (
                                        <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>

                        <form.Field
                            name="slug"
                            validators={{
                                onChange: ({ value }) => !value ? "Slug is required" : undefined,
                            }}
                        >
                            {(field) => (
                                <div className="grid gap-2">
                                    <Label htmlFor={field.name}>Slug *</Label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. cloud"
                                    />
                                    {field.state.meta.errors ? (
                                        <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="icon">
                            {(field) => (
                                <div className="grid gap-2">
                                    <Label htmlFor={field.name}>Icon</Label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. server (Lucide)"
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="color">
                            {(field) => (
                                <div className="grid gap-2">
                                    <Label htmlFor={field.name}>Color</Label>
                                    <Input
                                        id={field.name}
                                        type="color"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="coverImageUrl">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Cover Image URL</Label>
                                <Input
                                    id={field.name}
                                    type="url"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="https://... or R2 key"
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="displayOrder">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Display Order</Label>
                                <Input
                                    id={field.name}
                                    type="number"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                                <p className="text-xs text-muted-foreground">Higher numbers appear first.</p>
                            </div>
                        )}
                    </form.Field>

                    <div className="border-t pt-4 space-y-4">
                        <p className="text-sm font-medium text-muted-foreground">SEO (Optional)</p>
                        <form.Field name="metaTitle">
                            {(field) => (
                                <div className="grid gap-2">
                                    <Label htmlFor={field.name}>Meta Title</Label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Custom SEO title"
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="metaDescription">
                            {(field) => (
                                <div className="grid gap-2">
                                    <Label htmlFor={field.name}>Meta Description</Label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Custom SEO description"
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Category"}
                                </Button>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
