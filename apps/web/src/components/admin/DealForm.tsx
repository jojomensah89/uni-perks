"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus, Eye } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { ImageUpload } from "./ImageUpload";
import DealCard from "@/components/DealCard";
import { parseGeoOverridesFromText } from "@/lib/deal-geo-config";
import type { ApiBrandResponse } from "@/types/api";
import type { ApiCategoryResponse } from "@/types/api";

interface DealFormProps {
    brands: ApiBrandResponse[];
    categories: ApiCategoryResponse[];
    onSuccess?: () => void;
}

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

// Deferred uploader ref type
interface DeferredUploadRef {
    file: File | null;
    folder: string;
}

function isValidUrl(url: string) {
    try { new URL(url); return true; } catch { return false; }
}

export function DealForm({ brands, categories, onSuccess }: DealFormProps) {
    const [open, setOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [pendingImageRef] = useState<DeferredUploadRef>({ file: null, folder: "deals" });
    const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    const createDealMutation = useMutation({
        mutationFn: async (submitData: any) => {
            return fetchAPI("/api/admin/deals", {
                method: "POST",
                body: JSON.stringify(submitData),
            });
        },
    });

    const form = useForm({
        defaultValues: {
            title: "",
            slug: "",
            shortDescription: "",
            longDescription: "",
            brandId: "",
            categoryId: "",
            discountType: "percentage",
            discountLabel: "",
            discountValue: "",
            originalPrice: "",
            studentPrice: "",
            currency: "USD",
            claimUrl: "",
            affiliateUrl: "",
            coverImageUrl: "",
            verificationMethod: "edu_email",
            eligibilityNote: "",
            howToRedeem: "",
            conditions: "",
            termsUrl: "",
            minimumSpend: "",
            isNewCustomerOnly: false,
            isFeatured: false,
            isExclusive: false,
            isActive: true,
            expirationDate: "",
            metaTitle: "",
            metaDescription: "",
            geoOverridesJson: "[]",
        },
        onSubmit: async ({ value }) => {
            try {
                const geoOverrides = parseGeoOverridesFromText(value.geoOverridesJson);
                const { geoOverridesJson, ...rawValues } = value;
                let coverImageUrl = value.coverImageUrl;

                // Upload pending image if any
                if (pendingImageRef.file) {
                    const formData = new FormData();
                    formData.append("file", pendingImageRef.file);
                    formData.append("folder", pendingImageRef.folder);
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
                    expirationDate: value.expirationDate ? new Date(value.expirationDate).getTime() : null,
                };
                const createdDeal = await createDealMutation.mutateAsync(submitData) as { id?: string };

                if (createdDeal?.id && geoOverrides.length > 0) {
                    await Promise.all(
                        geoOverrides.map((geoOverride) =>
                            fetchAPI(`/api/admin/deals/${createdDeal.id}/geo-config/${geoOverride.countryCode}`, {
                                method: "PUT",
                                body: JSON.stringify(geoOverride),
                            })
                        )
                    );
                }

                toast.success("Deal created successfully!");
                setOpen(false);
                form.reset();
                pendingImageRef.file = null;
                setLocalImagePreview(null);
                queryClient.invalidateQueries({ queryKey: ["admin_deals"] });
                if (onSuccess) onSuccess();
            } catch (error: any) {
                toast.error(error.message || "Failed to create deal");
            }
        },
    });

    // Build live preview data
    const formValues = useStore(form.store, (s) => s.values);
    const selectedBrand = brands.find((b) => b.id === formValues.brandId);
    const selectedCategory = categories.find((c) => c.id === formValues.categoryId);

    const previewData = {
        deal: {
            id: "preview",
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
            expirationDate: formValues.expirationDate || null,
            howToRedeem: formValues.howToRedeem || null,
            conditions: formValues.conditions || null,
        },
        brand: {
            id: selectedBrand?.id || "preview-brand",
            name: selectedBrand?.name || "Brand Name",
            slug: selectedBrand?.slug || "brand",
            logoUrl: selectedBrand?.logoUrl || null,
            coverImageUrl: null,
        },
        category: {
            id: selectedCategory?.id || "preview-category",
            name: selectedCategory?.name || "Category",
            slug: selectedCategory?.slug || "category",
            color: null,
        },
    };

    return (
        <Dialog open={open} onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
                setShowPreview(false);
                setLocalImagePreview(null);
                pendingImageRef.file = null;
            }
        }}>
            <DialogTrigger>
                <div className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deal
                </div>
            </DialogTrigger>
            <DialogContent className={showPreview ? "sm:max-w-6xl max-w-[95vw]" : "sm:max-w-3xl max-w-[95vw]"}>
                <DialogHeader>
                    <div className="flex items-center justify-between pr-6">
                        <div>
                            <DialogTitle>Add New Deal</DialogTitle>
                            <DialogDescription>
                                Create a new student perk or discount.
                            </DialogDescription>
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
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                        className={`py-4 max-h-[75vh] overflow-y-auto px-1 ${showPreview ? "flex-1" : "w-full"}`}
                    >
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 mb-4">
                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="geo">Geo</TabsTrigger>
                                <TabsTrigger value="seo">SEO</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
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
                                        onChange: ({ value }) => !value?.trim() ? "Title is required" : undefined,
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
                                            {field.state.meta.errors.length > 0 && (
                                                <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                            )}
                                        </div>
                                    )}
                                </form.Field>

                                {/* Slug */}
                                <form.Field
                                    name="slug"
                                    validators={{
                                        onChange: ({ value }) => !value?.trim() ? "Slug is required" : undefined,
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
                                            {field.state.meta.errors.length > 0 && (
                                                <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                            )}
                                        </div>
                                    )}
                                </form.Field>

                                {/* Brand */}
                                <form.Field
                                    name="brandId"
                                    validators={{
                                        onChange: ({ value }) => !value ? "Brand is required" : undefined,
                                    }}
                                >
                                    {(field) => {
                                        const selectedBrandObj = brands.find((b) => b.id === field.state.value);
                                        const comboValue = selectedBrandObj ? { value: selectedBrandObj.id, label: selectedBrandObj.name } : null;
                                        return (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Brand *</Label>
                                            <Combobox
                                                value={comboValue}
                                                onValueChange={(v: any) => field.handleChange(v?.value ?? "")}
                                                isItemEqualToValue={(item: any, selected: any) => item.value === selected.value}
                                            >
                                                <ComboboxInput showTrigger placeholder="Search Brand..." className="w-full h-9" />
                                                <ComboboxContent>
                                                    {brands.length === 0 && <ComboboxEmpty>No brand found.</ComboboxEmpty>}
                                                    <ComboboxList>
                                                        {brands.map((b) => (
                                                            <ComboboxItem key={b.id} value={{ value: b.id, label: b.name }}>
                                                                {b.name}
                                                            </ComboboxItem>
                                                        ))}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            {field.state.meta.errors.length > 0 && (
                                                <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                            )}
                                        </div>
                                    )}}
                                </form.Field>

                                {/* Category */}
                                <form.Field
                                    name="categoryId"
                                    validators={{
                                        onChange: ({ value }) => !value ? "Category is required" : undefined,
                                    }}
                                >
                                    {(field) => {
                                        const selectedCatObj = categories.find((c) => c.id === field.state.value);
                                        const comboValue = selectedCatObj ? { value: selectedCatObj.id, label: selectedCatObj.name } : null;
                                        return (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Category *</Label>
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
                                            {field.state.meta.errors.length > 0 && (
                                                <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                            )}
                                        </div>
                                    )}}
                                </form.Field>

                                {/* Discount Label */}
                                <form.Field
                                    name="discountLabel"
                                    validators={{
                                        onChange: ({ value }) => !value?.trim() ? "Discount label is required" : undefined,
                                    }}
                                >
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Discount Label *</Label>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="e.g. 50% OFF"
                                            />
                                            {field.state.meta.errors.length > 0 && (
                                                <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                            )}
                                        </div>
                                    )}
                                </form.Field>

                                {/* Claim URL */}
                                <form.Field
                                    name="claimUrl"
                                    validators={{
                                        onChange: ({ value }) => {
                                            if (!value?.trim()) return "Claim URL is required";
                                            if (!isValidUrl(value)) return "Must be a valid URL";
                                            return undefined;
                                        }
                                    }}
                                >
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Claim URL *</Label>
                                            <Input
                                                id={field.name}
                                                type="url"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="https://..."
                                            />
                                            {field.state.meta.errors.length > 0 && (
                                                <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                                            )}
                                        </div>
                                    )}
                                </form.Field>

                                {/* Short Description */}
                                <form.Field name="shortDescription">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={field.name}>Short Description</Label>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="A brief summary shown on cards."
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                {/* Cover Image — deferred upload */}
                                <form.Field name="coverImageUrl">
                                    {(field) => (
                                        <ImageUpload
                                            label="Cover Image"
                                            value={field.state.value}
                                            onChange={(key) => field.handleChange(key ?? "")}
                                            onFileSelected={(file) => {
                                                pendingImageRef.file = file;
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

                                {/* Verification Method */}
                                <form.Field name="verificationMethod">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Verification Method *</Label>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(v) => field.handleChange(v ?? "")}
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {VERIFICATION_METHODS.map((m) => (
                                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                    ))}
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
                                            <Label htmlFor={field.name}>Country Overrides (JSON)</Label>
                                            <div className="text-xs text-muted-foreground mb-2 p-3 bg-muted rounded-md border border-dashed border-border">
                                                <p className="font-medium mb-1">Example: USA (US)</p>
                                                <pre className="text-[10px] overflow-x-auto">
{`{
  "countryCode": "US",
  "currency": "USD",
  "studentPrice": 4.99,
  "originalPrice": 9.99,
  "claimUrl": "https://..."
}`}
                                                </pre>
                                            </div>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                rows={12}
                                                className="font-mono text-xs"
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
                                            <div className="space-y-1 mt-2">
                                                <p className="text-xs text-muted-foreground font-medium">Common ISO Codes:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">US (USA)</span>
                                                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">GB (UK)</span>
                                                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">CA (Canada)</span>
                                                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">AU (Australia)</span>
                                                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">GLOBAL</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </form.Field>
                            </TabsContent>

                            <TabsContent value="pricing" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Discount Type */}
                                <form.Field name="discountType">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Discount Type</Label>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(v) => field.handleChange(v ?? "")}
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
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

                                {/* Discount Value */}
                                <form.Field name="discountValue">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Discount Value</Label>
                                            <Input
                                                id={field.name}
                                                type="number"
                                                step="0.01"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="e.g. 50"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                {/* Original Price */}
                                <form.Field name="originalPrice">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Original Price</Label>
                                            <Input
                                                id={field.name}
                                                type="number"
                                                step="0.01"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="e.g. 9.99"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                {/* Student Price */}
                                <form.Field name="studentPrice">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Student Price</Label>
                                            <Input
                                                id={field.name}
                                                type="number"
                                                step="0.01"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="e.g. 4.99"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                {/* Currency */}
                                <form.Field name="currency">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label>Currency</Label>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(v) => field.handleChange(v ?? "")}
                                            >
                                                <SelectTrigger className="w-full h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
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

                                {/* Minimum Spend */}
                                <form.Field name="minimumSpend">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Minimum Spend</Label>
                                            <Input
                                                id={field.name}
                                                type="number"
                                                step="0.01"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="e.g. 50"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                {/* Affiliate URL */}
                                <form.Field name="affiliateUrl">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={field.name}>Affiliate URL</Label>
                                            <Input
                                                id={field.name}
                                                type="url"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="https://... (tracking link)"
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            </TabsContent>

                            <TabsContent value="details" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name="longDescription">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={field.name}>Long Description</Label>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Full details of the deal."
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="howToRedeem">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={field.name}>How to Redeem</Label>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Step-by-step instructions for claiming the deal."
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="conditions">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={field.name}>Conditions</Label>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="One condition per line. Shown in expandable accordion."
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="termsUrl">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Terms URL</Label>
                                            <Input
                                                id={field.name}
                                                type="url"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="eligibilityNote">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Eligibility Note</Label>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="e.g. US students only"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="expirationDate">
                                    {(field) => (
                                        <div className="grid gap-2">
                                            <Label htmlFor={field.name}>Expiration Date</Label>
                                            <Input
                                                id={field.name}
                                                type="date"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <form.Field name="isActive">
                                        {(field) => (
                                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="active-switch">Active</Label>
                                                    <p className="text-[0.7rem] text-muted-foreground">Visible to users</p>
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
                                                    <p className="text-[0.7rem] text-muted-foreground">Homepage highlight</p>
                                                </div>
                                                <Switch
                                                    id="featured-switch"
                                                    checked={field.state.value}
                                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                                />
                                            </div>
                                        )}
                                    </form.Field>

                                    <form.Field name="isExclusive">
                                        {(field) => (
                                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="exclusive-switch">Exclusive</Label>
                                                    <p className="text-[0.7rem] text-muted-foreground">UniPerks exclusive deal</p>
                                                </div>
                                                <Switch
                                                    id="exclusive-switch"
                                                    checked={field.state.value}
                                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                                />
                                            </div>
                                        )}
                                    </form.Field>

                                    <form.Field name="isNewCustomerOnly">
                                        {(field) => (
                                            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="newcustomer-switch">New Customers Only</Label>
                                                </div>
                                                <Switch
                                                    id="newcustomer-switch"
                                                    checked={field.state.value}
                                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                                />
                                            </div>
                                        )}
                                    </form.Field>
                                </div>
                            </TabsContent>

                            <TabsContent value="seo" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <form.Field name="metaTitle">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={field.name}>Meta Title</Label>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Custom title for SEO (optional)"
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="metaDescription">
                                    {(field) => (
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={field.name}>Meta Description</Label>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Custom description for SEO (optional)"
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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

                    {/* Live Preview Panel */}
                    {showPreview && (
                        <div className="w-full md:w-72 shrink-0 py-4">
                            <div className="sticky top-0">
                                <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                                    Live Preview
                                </p>
                                <div className="max-w-[280px]">
                                    <DealCard
                                        dealData={{
                                            ...previewData,
                                            deal: {
                                                ...previewData.deal,
                                                // Swap local preview in place of the real URL
                                                coverImageUrl: localImagePreview
                                                    ? `data:image/png;base64,__local__` // placeholder trigger
                                                    : previewData.deal.coverImageUrl,
                                            },
                                        } as any}
                                        _localImageOverride={localImagePreview}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-3">
                                    This is exactly how the card will appear on the site.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
