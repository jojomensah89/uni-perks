"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { ApiBrandResponse } from "@/app/admin/brands/page";
import type { ApiCategoryResponse } from "@/app/admin/categories/page";

interface DealFormProps {
    brands: ApiBrandResponse[];
    categories: ApiCategoryResponse[];
    onSuccess?: () => void;
}

export function DealForm({ brands, categories, onSuccess }: DealFormProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            title: "",
            slug: "",
            shortDescription: "",
            longDescription: "",
            brandId: "",
            categoryId: "",
            discountType: "percentage",
            discountValue: "",
            isActive: true,
            isFeatured: false,
        },
        onSubmit: async ({ value }) => {
            try {
                // To DO: Use actual admin creation endpoint
                await fetchAPI("/api/admin/deals", {
                    method: "POST",
                    body: JSON.stringify(value),
                });

                toast.success("Deal created successfully!");
                setOpen(false);
                form.reset();
                router.refresh();
                if (onSuccess) onSuccess();
            } catch (error: any) {
                toast.error(error.message || "Failed to create deal");
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deal
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>Add New Deal</DialogTitle>
                    <DialogDescription>
                        Create a new student perk or discount.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-2"
                >
                    <form.Field
                        name="title"
                        listeners={{
                            onChange: ({ value }) => {
                                if (value && !form.getFieldValue("slug")) {
                                    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                    form.setFieldValue("slug", slug);
                                }
                            }
                        }}
                        validators={{
                            onChange: ({ value }) => !value ? "Title is required" : undefined,
                        }}
                    >
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Title *</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. 50% Off Spotify Premium"
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
                                    placeholder="e.g. spotify-premium-student"
                                />
                                {field.state.meta.errors ? (
                                    <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                ) : null}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="brandId">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label>Brand *</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                >
                                    <option value="" disabled>Select Brand</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="categoryId">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label>Category *</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="discountType">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label>Discount Type</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ($)</option>
                                    <option value="bogo">BOGO</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="discountValue">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Discount Value</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. 50"
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="shortDescription">
                        {(field) => (
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor={field.name}>Short Description</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="A brief summary for cards."
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="longDescription">
                        {(field) => (
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor={field.name}>Long Description</Label>
                                <Textarea
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Full details of the deal."
                                    rows={4}
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="isActive">
                        {(field) => (
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label htmlFor="active-switch">Active</Label>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Make this deal visible to users.
                                    </p>
                                </div>
                                <Switch
                                    id="active-switch"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="isFeatured">
                        {(field) => (
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label htmlFor="featured-switch">Featured</Label>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Highlight this deal on the homepage.
                                    </p>
                                </div>
                                <Switch
                                    id="featured-switch"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
                            </div>
                        )}
                    </form.Field>

                    <div className="flex justify-end gap-2 mt-6 md:col-span-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Deal"}
                                </Button>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
