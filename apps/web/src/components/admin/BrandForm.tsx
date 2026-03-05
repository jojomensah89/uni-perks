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
import { ImageUpload } from "./ImageUpload";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface BrandFormProps {
    onSuccess?: () => void;
}

export function BrandForm({ onSuccess }: BrandFormProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();


    const createBrandMutation = useMutation({
        mutationFn: async (data: any) => {
            return fetchAPI("/api/admin/brands", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
    });

    const form = useForm({
        defaultValues: {
            name: "",
            slug: "",
            tagline: "",
            description: "",
            website: "",
            logoUrl: "",
            coverImageUrl: "",
            whyWeLoveIt: "",
            isVerified: false,
            metaTitle: "",
            metaDescription: "",
        },
        onSubmit: async ({ value }) => {
            try {
                await createBrandMutation.mutateAsync(value);

                toast.success("Brand created successfully!");
                setOpen(false);
                form.reset();
                queryClient.invalidateQueries({ queryKey: ["adminBrands"] });
                if (onSuccess) onSuccess();
            } catch (error: any) {
                toast.error(error.message || "Failed to create brand");
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Brand
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Add New Brand</DialogTitle>
                    <DialogDescription>
                        Create a partner brand profile.
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
                                        placeholder="e.g. Acme Corp"
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
                                        placeholder="e.g. acme-corp"
                                    />
                                    {field.state.meta.errors ? (
                                        <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="website">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Website URL</Label>
                                <Input
                                    id={field.name}
                                    type="url"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="https://example.com"
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="tagline">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Tagline</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. The best widgets in the world."
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="description">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Description</Label>
                                <Textarea
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Detailed description of the brand."
                                    rows={3}
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="whyWeLoveIt">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Why We Love It</Label>
                                <Textarea
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Staff editorial note about why this brand is great for students."
                                    rows={2}
                                />
                            </div>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="logoUrl">
                            {(field) => (
                                <ImageUpload
                                    label="Logo"
                                    value={field.state.value}
                                    onChange={(key) => field.handleChange(key)}
                                    folder="brands/logos"
                                />
                            )}
                        </form.Field>

                        <form.Field name="coverImageUrl">
                            {(field) => (
                                <ImageUpload
                                    label="Cover Image"
                                    value={field.state.value}
                                    onChange={(key) => field.handleChange(key)}
                                    folder="brands/covers"
                                />
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="isVerified">
                        {(field) => (
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label htmlFor="verified-switch">Verified Status</Label>
                                    <p className="text-xs text-muted-foreground">Mark this brand as verified.</p>
                                </div>
                                <Switch
                                    id="verified-switch"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
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
                                    {isSubmitting ? "Creating..." : "Create Brand"}
                                </Button>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
