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

interface BrandFormProps {
    onSuccess?: () => void;
}

export function BrandForm({ onSuccess }: BrandFormProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            name: "",
            slug: "",
            tagline: "",
            description: "",
            website: "",
            logoUrl: "",
            isVerified: false,
        },
        onSubmit: async ({ value }) => {
            try {
                // To DO: Use actual admin creation endpoint
                await fetchAPI("/api/brands", {
                    method: "POST",
                    body: JSON.stringify(value),
                });

                toast.success("Brand created successfully!");
                setOpen(false);
                form.reset();
                router.refresh();
                if (onSuccess) onSuccess();
            } catch (error: any) {
                toast.error(error.message || "Failed to create brand");
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <div className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Brand
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                    className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2"
                >
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

                    <form.Field name="website">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label htmlFor={field.name}>Website URL (Optional)</Label>
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
                                <Label htmlFor={field.name}>Tagline (Optional)</Label>
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
                                <Label htmlFor={field.name}>Description (Optional)</Label>
                                <Textarea
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Detailed description of the brand."
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="isVerified">
                        {(field) => (
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label htmlFor="verified-switch">Verified Status</Label>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Mark this brand as verified.
                                    </p>
                                </div>
                                <Switch
                                    id="verified-switch"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
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
