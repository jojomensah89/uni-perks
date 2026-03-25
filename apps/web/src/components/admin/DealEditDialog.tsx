"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye } from "lucide-react";

import DealCard from "@/components/DealCard";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "./ImageUpload";
import { fetchAPI } from "@/lib/api";
import type { ApiDealResponse } from "@/types/api";
import type { ApiBrandResponse } from "@/types/api";
import type { ApiCategoryResponse } from "@/types/api";

const VERIFICATION_METHODS = [
    { value: "edu_email", label: ".edu Email" },
    { value: "student_id", label: "Student ID Upload" },
    { value: "none", label: "No Verification" },
];

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

interface DealEditDialogProps {
    deal: ApiDealResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brands?: ApiBrandResponse[];
    categories?: ApiCategoryResponse[];
}

const EMPTY_BRANDS: ApiBrandResponse[] = [];
const EMPTY_CATEGORIES: ApiCategoryResponse[] = [];

export function DealEditDialog({ deal, open, onOpenChange, brands = EMPTY_BRANDS, categories = EMPTY_CATEGORIES }: DealEditDialogProps) {
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const router = useRouter();

    const d = deal.deal;

    const form = useForm({
        defaultValues: {
            title: d.title || "",
            slug: d.slug || "",
            shortDescription: d.shortDescription || "",
            longDescription: (d as any).longDescription || "",
            brandId: deal.brand?.id || "",
            categoryId: deal.category?.id || "",
            discountType: (d as any).discountType || "percent",
            discountLabel: d.discountLabel || "",
            discountValue: d.discountValue != null ? String(d.discountValue) : "",
            originalPrice: d.originalPrice != null ? String(d.originalPrice) : "",
            studentPrice: d.studentPrice != null ? String(d.studentPrice) : "",
            currency: (d as any).currency || "USD",
            claimUrl: (d as any).claimUrl || "",
            affiliateUrl: (d as any).affiliateUrl || "",
            coverImageUrl: d.coverImageUrl || "",
            verificationMethod: d.verificationMethod || "edu_email",
            eligibilityNote: (d as any).eligibilityNote || "",
            howToRedeem: d.howToRedeem || "",
            conditions: d.conditions || "",
            termsUrl: (d as any).termsUrl || "",
            minimumSpend: (d as any).minimumSpend != null ? String((d as any).minimumSpend) : "",
            isNewCustomerOnly: (d as any).isNewCustomerOnly || false,
            isFeatured: d.isFeatured || false,
            status: (d as any).status || "draft",
            metaTitle: (d as any).metaTitle || "",
            metaDescription: (d as any).metaDescription || "",
        },
        onSubmit: async ({ value }) => {
            try {
                const { status, ...rawValues } = value;
                let coverImageUrl = value.coverImageUrl;

                if (pendingFile) {
                    const formData = new FormData();
                    formData.append("file", pendingFile);
                    formData.append("folder", "deals");
                    const uploadRes = await fetch(`${API_URL}/api/upload`, {
                        method: "POST",
                        body: formData,
                        credentials: "include",
                    });
                    if (!uploadRes.ok) throw new Error("Image upload failed");
                    const uploadData = await uploadRes.json() as { key: string };
                    coverImageUrl = uploadData.key;
                }

                const submitData = {
                    ...rawValues,
                    status: status || "draft",
                    coverImageUrl,
                    discountValue: value.discountValue ? parseFloat(value.discountValue) : null,
                    originalPrice: value.originalPrice ? parseFloat(value.originalPrice) : null,
                    studentPrice: value.studentPrice ? parseFloat(value.studentPrice) : null,
                    minimumSpend: value.minimumSpend ? parseFloat(value.minimumSpend) : null,
                };

                await fetchAPI(`/api/admin/deals/${d.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(submitData),
                });

                

                toast.success("Deal updated successfully!");
                queryClient.invalidateQueries({ queryKey: ["admin_deals"] });
                onOpenChange(false);
            } catch (error: any) {
                toast.error(error.message || "Failed to update deal");
            }
        },
    });

    const formValues = useStore(form.store, (s) => s.values);
    const selectedBrand = brands.find((b) => b.id === formValues.brandId);
    const selectedCategory = categories.find((c) => c.id === formValues.categoryId);

    const [showPreview, setShowPreview] = useState(false);
    const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);

    const previewData = {
        deal: {
            id: d.id,
            slug: formValues.slug || "preview",
            title: formValues.title || "Deal Title",
            shortDescription: formValues.shortDescription || "Short description of the deal",
            discountType: formValues.discountType,
            discountLabel: formValues.discountLabel || "Special Offer",
            discountValue: formValues.discountValue ? parseFloat(formValues.discountValue) : null,
            originalPrice: formValues.originalPrice ? parseFloat(formValues.originalPrice) : null,
            studentPrice: formValues.studentPrice ? parseFloat(formValues.studentPrice) : null,
            currency: formValues.currency || "USD",
            verificationMethod: formValues.verificationMethod,
            claimUrl: formValues.claimUrl || "#",
            coverImageUrl: localImagePreview ? "__local_preview__" : (formValues.coverImageUrl || null),
            isFeatured: formValues.isFeatured,
            expirationDate: d.expirationDate || null,
            howToRedeem: formValues.howToRedeem || null,
            conditions: formValues.conditions || null,
        },
        brand: {
            id: selectedBrand?.id || deal.brand?.id || "preview-brand",
            name: selectedBrand?.name || deal.brand?.name || "Brand Name",
            slug: selectedBrand?.slug || deal.brand?.slug || "brand",
            logoUrl: selectedBrand?.logoUrl || deal.brand?.logoUrl || null,
            coverImageUrl: null,
        },
        category: {
            id: selectedCategory?.id || deal.category?.id || "preview-category",
            name: selectedCategory?.name || deal.category?.name || "Category",
            slug: selectedCategory?.slug || deal.category?.slug || "category",
            color: null,
        },
    };

    return (
        <Dialog open={open} onOpenChange={(o) => {
            onOpenChange(o);
            if (!o) {
                setShowPreview(false);
                setLocalImagePreview(null);
                setPendingFile(null);
            }
        }}>
            <DialogContent className={showPreview ? "sm:max-w-6xl max-w-[95vw]" : "sm:max-w-3xl max-w-[95vw]"}>
                <DialogHeader>
                    <div className="flex items-center justify-between pr-6">
                        <div>
                            <DialogTitle>Edit Deal</DialogTitle>
                            <DialogDescription>Update deal information for "{d.title}"</DialogDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview((p) => !p)}
                            className="flex items-center gap-2 shrink-0"
                        >
                            <Eye className="h-4 w-4" />
                            {showPreview ? "Hide Preview" : "Preview Card"}
                        </Button>
                    </div>
                </DialogHeader>

                <div className={`flex gap-6 ${showPreview ? "flex-col md:flex-row" : ""}`}>
                    {/* Form */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
                        className={`py-4 max-h-[75vh] overflow-y-auto px-1 ${showPreview ? "flex-1" : "w-full"}`}
                    >
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name="title" validators={{ onChange: ({ value }) => !value?.trim() ? "Required" : undefined }}>
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Title *</Label>
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

                                {brands.length > 0 && (
                                    <form.Field name="brandId">
                                        {(field) => {
                                            const selectedBrandObj = brands.find((b) => b.id === field.state.value);
                                            const comboValue = selectedBrandObj ? { value: selectedBrandObj.id, label: selectedBrandObj.name } : null;
                                            return (
                                                <div className="grid gap-2">
                                                    <Label>Brand</Label>
                                                    <Combobox
                                                        value={comboValue}
                                                        onValueChange={(v: any) => field.handleChange(v?.value ?? "")}
                                                        isItemEqualToValue={(item: any, selected: any) => item.value === selected.value}
                                                    >
                                                        <ComboboxInput showTrigger placeholder="Search Brand..." className="w-full h-9" />
                                                        <ComboboxContent>
                                                            {brands.length === 0 ? <ComboboxEmpty>No brand found.</ComboboxEmpty> : (
                                                                <ComboboxList>
                                                                    {brands.map((b) => (
                                                                        <ComboboxItem key={b.id} value={{ value: b.id, label: b.name }}>
                                                                            {/* <DealLogo logoUrl={b.logoUrl} name={b.name} /> */}
                                                                            {b.name}
                                                                        </ComboboxItem>
                                                                    ))}
                                                                </ComboboxList>
                                                            )}
                                                        </ComboboxContent>
                                                    </Combobox>
                                                </div>
                                            );
                                        }}
                                    </form.Field>
                                )}

                                {categories.length > 0 && (
                                    <form.Field name="categoryId">
                                        {(field) => {
                                            const selectedCatObj = categories.find((c) => c.id === field.state.value);
                                            const comboValue = selectedCatObj ? { value: selectedCatObj.id, label: selectedCatObj.name } : null;
                                            return (
                                                <div className="grid gap-2">
                                                    <Label>Category</Label>
                                                    <Combobox
                                                        value={comboValue}
                                                        onValueChange={(v: any) => field.handleChange(v?.value ?? "")}
                                                        isItemEqualToValue={(item: any, selected: any) => item.value === selected.value}
                                                    >
                                                        <ComboboxInput showTrigger placeholder="Search Category..." className="w-full h-9" />
                                                        <ComboboxContent>
                                                            {categories.length === 0 && <ComboboxEmpty>No category found.</ComboboxEmpty>}
                                                            <ComboboxList>
                                                                {categories.map((c) => (
                                                                    <ComboboxItem key={c.id} value={{ value: c.id, label: c.name }}>
                                                                        {c.name}
                                                                    </ComboboxItem>
                                                                ))}
                                                            </ComboboxList>
                                                        </ComboboxContent>
                                                    </Combobox>
                                                </div>
                                            );
                                        }}
                                    </form.Field>
                                )}

                                <form.Field name="discountLabel" validators={{ onChange: ({ value }) => !value?.trim() ? "Required" : undefined }}>
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Discount Label *</Label>
                                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="e.g. 50% OFF" />
                                            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>}
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="claimUrl" validators={{ onChange: ({ value }) => !value?.trim() ? "Required" : undefined }}>
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Claim URL *</Label>
                                            <Input type="url" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                            {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>}
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="shortDescription">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label>Short Description</Label>
                                            <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="coverImageUrl">
                                    {(field) => (
                                        <ImageUpload
                                            label="Cover Image"
                                            value={field.state.value}
                                            onChange={(key) => field.handleChange(key ?? "")}
                                            onFileSelected={(file) => {
                                                setPendingFile(file);
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => setLocalImagePreview(e.target?.result as string);
                                                    reader.readAsDataURL(file);
                                                } else {
                                                    setLocalImagePreview(null);
                                                }
                                            }}
                                            folder="deals"
                                            immediateUpload={false}
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="verificationMethod">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Verification Method</Label>
                                            <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? "")}>
                                                <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {VERIFICATION_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </form.Field>
                            </TabsContent>

                            <TabsContent value="pricing" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name="discountType">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Discount Type</Label>
                                            <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? "")}>
                                                <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percent">Percentage (%)</SelectItem>
                                                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="discountValue">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Discount Value</Label>
                                            <Input type="number" step="0.01" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="originalPrice">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Original Price</Label>
                                            <Input type="number" step="0.01" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="studentPrice">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Student Price</Label>
                                            <Input type="number" step="0.01" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="currency">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Currency</Label>
                                            <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? "")}>
                                                <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                                    <SelectItem value="CAD">CAD ($)</SelectItem>
                                                    <SelectItem value="AUD">AUD ($)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </form.Field>
                            </TabsContent>

                            <TabsContent value="details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name="longDescription">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label>Long Description</Label>
                                            <Textarea rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="howToRedeem">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label>How to Redeem</Label>
                                            <Textarea rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="conditions">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label>Conditions</Label>
                                            <Textarea rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        </div>
                                    )}
                                </form.Field>

                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <form.Field name="status">
                                        {(field) => (
                                            <div className="grid gap-2">
                                                <Label>Status</Label>
                                                <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? "draft")}>
                                                    <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="published">Published</SelectItem>
                                                        <SelectItem value="archived">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </form.Field>

                                    <form.Field name="isFeatured">
                                        {(field) => (
                                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label>Featured</Label>
                                                </div>
                                                <Switch checked={field.state.value} onCheckedChange={(v) => field.handleChange(v)} />
                                            </div>
                                        )}
                                    </form.Field>

                                    <form.Field name="isNewCustomerOnly">
                                        {(field) => (
                                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label>New Customers Only</Label>
                                                </div>
                                                <Switch checked={field.state.value} onCheckedChange={(v) => field.handleChange(v)} />
                                            </div>
                                        )}
                                    </form.Field>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 bg-muted/30 p-4 rounded-xl border border-border mt-4 md:mt-0 max-h-[75vh] overflow-y-auto">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Live Preview</h3>
                            {/* @ts-ignore - deal property is partially mocked */}
                            <DealCard dealData={previewData} _localImageOverride={localImagePreview} />
                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                This is exactly how the card will appear on the site.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
