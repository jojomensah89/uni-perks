"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "./ImageUpload";
import { fetchAPI } from "@/lib/api";
import type { ApiBrandResponse } from "@/app/admin/brands/page";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

interface BrandEditDialogProps {
    brand: ApiBrandResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BrandEditDialog({ brand, open, onOpenChange }: BrandEditDialogProps) {
    const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
    const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const router = useRouter();

    const updateBrandMutation = useMutation({
        mutationFn: async (data: any) => {
            return fetchAPI(`/api/admin/brands/${brand.id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });
        },
    });

    const form = useForm({
        defaultValues: {
            name: brand.name || "",
            slug: brand.slug || "",
            tagline: brand.tagline || "",
            description: brand.description || "",
            website: brand.website || "",
            whyWeLoveIt: (brand as any).whyWeLoveIt || "",
            logoUrl: brand.logoUrl || "",
            coverImageUrl: brand.coverImageUrl || "",
            isVerified: brand.isVerified ?? false,
            metaTitle: (brand as any).metaTitle || "",
            metaDescription: (brand as any).metaDescription || "",
        },
        onSubmit: async ({ value }) => {
            try {
                let logoUrl = value.logoUrl;
                let coverImageUrl = value.coverImageUrl;

                if (pendingLogoFile) {
                    const formData = new FormData();
                    formData.append("file", pendingLogoFile);
                    formData.append("folder", "brands");
                    const uploadRes = await fetch(`${API_URL}/api/upload`, {
                        method: "POST", body: formData, credentials: "include",
                    });
                    if (!uploadRes.ok) throw new Error("Logo upload failed");
                    logoUrl = (await uploadRes.json() as { key: string }).key;
                }

                if (pendingCoverFile) {
                    const formData = new FormData();
                    formData.append("file", pendingCoverFile);
                    formData.append("folder", "brands");
                    const uploadRes = await fetch(`${API_URL}/api/upload`, {
                        method: "POST", body: formData, credentials: "include",
                    });
                    if (!uploadRes.ok) throw new Error("Cover image upload failed");
                    coverImageUrl = (await uploadRes.json() as { key: string }).key;
                }

                await updateBrandMutation.mutateAsync({ ...value, logoUrl, coverImageUrl });

                toast.success("Brand updated successfully!");
                queryClient.invalidateQueries({ queryKey: ["adminBrands"] });
                onOpenChange(false);
            } catch (error: any) {
                toast.error(error.message || "Failed to update brand");
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Edit Brand</DialogTitle>
                    <DialogDescription>Update brand information for "{brand.name}"</DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
                    className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto px-1"
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

                    <form.Field name="tagline">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label>Tagline</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Short brand tagline" />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="website">
                        {(field) => (
                            <div className="grid gap-2">
                                <Label>Website</Label>
                                <Input type="url" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="https://..." />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="description">
                        {(field) => (
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Description</Label>
                                <Textarea rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="logoUrl">
                        {(field) => (
                            <ImageUpload
                                label="Logo"
                                value={field.state.value}
                                onChange={(key) => field.handleChange(key ?? "")}
                                onFileSelected={(file) => setPendingLogoFile(file)}
                                folder="brands"
                                immediateUpload={false}
                            />
                        )}
                    </form.Field>

                    <form.Field name="coverImageUrl">
                        {(field) => (
                            <ImageUpload
                                label="Cover Image"
                                value={field.state.value}
                                onChange={(key) => field.handleChange(key ?? "")}
                                onFileSelected={(file) => setPendingCoverFile(file)}
                                folder="brands"
                                immediateUpload={false}
                            />
                        )}
                    </form.Field>

                    <form.Field name="isVerified">
                        {(field) => (
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label>Verified</Label>
                                    <p className="text-[0.7rem] text-muted-foreground">Mark brand as verified partner</p>
                                </div>
                                <Switch checked={field.state.value} onCheckedChange={(v) => field.handleChange(v)} />
                            </div>
                        )}
                    </form.Field>

                    <div className="flex justify-end gap-2 md:col-span-2 pt-4 border-t mt-2">
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
