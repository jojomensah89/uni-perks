"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { parseGeoOverridesFromText, serializeGeoOverrides, type DealGeoOverrideInput } from "@/lib/deal-geo-config";
import type { ApiDealResponse } from "@/types/api";
import type { ApiBrandResponse } from "@/types/api";
import type { ApiCategoryResponse } from "@/types/api";

const VERIFICATION_METHODS = [
    { value: "edu_email", label: ".edu Email" },
    { value: "sheerid", label: "SheerID" },
    { value: "unidays", label: "UNiDAYS" },
    { value: "student_beans", label: "Student Beans" },
    { value: "student_id", label: "Student ID Upload" },
    { value: "github_student", label: "GitHub Student Pack" },
    { value: "isic", label: "ISIC Card" },
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

interface DealGeoConfigResponse extends DealGeoOverrideInput {
    id: string;
    dealId: string;
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
            discountType: (d as any).discountType || "percentage",
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
            isExclusive: (d as any).isExclusive || false,
            isActive: d.isActive !== false,
            metaTitle: (d as any).metaTitle || "",
            metaDescription: (d as any).metaDescription || "",
            geoOverridesJson: "[]",
        },
        onSubmit: async ({ value }) => {
            try {
                const geoOverrides = parseGeoOverridesFromText(value.geoOverridesJson);
                const existingGeoOverrides = geoConfigQuery.data?.geoConfig || [];
                const { geoOverridesJson, ...rawValues } = value;
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

                if (geoOverrides.length > 0) {
                    await Promise.all(
                        geoOverrides.map((geoOverride) =>
                            fetchAPI(`/api/admin/deals/${d.id}/geo-config/${geoOverride.countryCode}`, {
                                method: "PUT",
                                body: JSON.stringify(geoOverride),
                            })
                        )
                    );
                }

                const nextCodes = new Set(geoOverrides.map((row) => row.countryCode));
                const staleOverrides = existingGeoOverrides.filter((row) => !nextCodes.has(row.countryCode));
                if (staleOverrides.length > 0) {
                    await Promise.all(
                        staleOverrides.map((staleRow) =>
                            fetchAPI(`/api/admin/deals/${d.id}/geo-config/${staleRow.countryCode}`, {
                                method: "DELETE",
                            })
                        )
                    );
                }

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
    const geoConfigQuery = useQuery({
        queryKey: ["admin_deal_geo_config", d.id],
        enabled: open,
        queryFn: () => fetchAPI<{ geoConfig: DealGeoConfigResponse[] }>(`/api/admin/deals/${d.id}/geo-config`),
    });

    useEffect(() => {
        const rows = geoConfigQuery.data?.geoConfig;
        if (!rows) return;
        form.setFieldValue("geoOverridesJson", serializeGeoOverrides(rows));
    }, [form, geoConfigQuery.data?.geoConfig]);

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
            isActive: formValues.isActive,
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
                            <TabsList className="grid w-full grid-cols-4 mb-4">
                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="geo">Geo</TabsTrigger>
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
                                        {(field) => (
                                            <div className="grid gap-2">
                                                <Label>Brand</Label>
                                                <Combobox value={field.state.value} onValueChange={(v) => field.handleChange(v ?? "")}>
                                                    <ComboboxInput showTrigger placeholder="Search Brand..." className="w-full h-9" />
                                                    <ComboboxContent>
                                                        <ComboboxEmpty>No brand found.</ComboboxEmpty>
                                                        <ComboboxList>
                                                            {brands.map((b) => (
                                                                <ComboboxItem key={b.id} value={b.id}>
                                                                    {b.name}
                                                                </ComboboxItem>
                                                            ))}
                                                        </ComboboxList>
                                                    </ComboboxContent>
                                                </Combobox>
                                            </div>
                                        )}
                                    </form.Field>
                                )}

                                {categories.length > 0 && (
                                    <form.Field name="categoryId">
                                        {(field) => (
                                            <div className="grid gap-2">
                                                <Label>Category</Label>
                                                <Combobox value={field.state.value} onValueChange={(v) => field.handleChange(v ?? "")}>
                                                    <ComboboxInput showTrigger placeholder="Search Category..." className="w-full h-9" />
                                                    <ComboboxContent>
                                                        <ComboboxEmpty>No category found.</ComboboxEmpty>
                                                        <ComboboxList>
                                                            {categories.map((c) => (
                                                                <ComboboxItem key={c.id} value={c.id}>
                                                                    {c.name}
                                                                </ComboboxItem>
                                                            ))}
                                                        </ComboboxList>
                                                    </ComboboxContent>
                                                </Combobox>
                                            </div>
                                        )}
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

                            <TabsContent value="geo" className="grid grid-cols-1 gap-4">
                                <form.Field name="geoOverridesJson">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Country Pricing & Links JSON</Label>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                rows={12}
                                                placeholder={`[
  {
    "countryCode": "US",
    "affiliateUrl": "https://...",
    "claimUrl": "https://...",
    "studentPrice": 4.99,
    "originalPrice": 9.99,
    "currency": "USD",
    "discountLabel": "50% OFF",
    "isAvailable": true
  }
]`}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Keep this as a JSON array. Use ISO alpha-2 country codes or <code>GLOBAL</code>.
                                            </p>
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
                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                                    <SelectItem value="free">Free</SelectItem>
                                                    <SelectItem value="trial">Free Trial</SelectItem>
                                                    <SelectItem value="bogo">BOGO</SelectItem>
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
                                    <form.Field name="isActive">
                                        {(field) => (
                                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label>Active</Label>
                                                    <p className="text-[0.7rem] text-muted-foreground">Visible to users</p>
                                                </div>
                                                <Switch checked={field.state.value} onCheckedChange={(v) => field.handleChange(v)} />
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
