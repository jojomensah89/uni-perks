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
        },
        onSubmit: async ({ value }) => {
            try {
                // To DO: Use actual admin creation endpoint
                // Right now we hit a generic endpoint just to simulate creating
                await fetchAPI("/api/categories", {
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
                <div className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                    className="grid gap-4 py-4"
                >
                    <form.Field
                        name="name"
                        listeners={{
                            onChange: ({ value }) => {
                                // Auto-generate slug
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
                                <Label htmlFor={field.name}>Name</Label>
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
                                <Label htmlFor={field.name}>Slug</Label>
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

                    <form.Field
                        name="icon"
                    >
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Icon (Optional)</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. server"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lucide icon name to display for this category.
                                </p>
                            </div>
                        )}
                    </form.Field>

                    <div className="flex justify-end gap-2 mt-4">
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
