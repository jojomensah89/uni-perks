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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        },
        onSubmit: async ({ value }) => {
            try {
                // Transform numeric fields
                const submitData = {
                    ...value,
                    discountValue: value.discountValue ? parseFloat(value.discountValue) : null,
                    originalPrice: value.originalPrice ? parseFloat(value.originalPrice) : null,
                    studentPrice: value.studentPrice ? parseFloat(value.studentPrice) : null,
                    minimumSpend: value.minimumSpend ? parseFloat(value.minimumSpend) : null,
                    expirationDate: value.expirationDate ? new Date(value.expirationDate).getTime() : null,
                };

                await fetchAPI("/api/admin/deals", {
                    method: "POST",
                    body: JSON.stringify(submitData),
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
                <div className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deal
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-w-[95vw]">
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
                    className="py-4 max-h-[75vh] overflow-y-auto px-1"
                >
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-4">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="seo">SEO</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                                            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

                            <form.Field name="discountLabel">
                                {(field) => (
                                    <div className="grid gap-2">
                                        <Label htmlFor={field.name}>Discount Label *</Label>
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="e.g. 50% OFF"
                                        />
                                    </div>
                                )}
                            </form.Field>

                            <form.Field name="claimUrl">
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

                            <form.Field name="verificationMethod">
                                {(field) => (
                                    <div className="grid gap-2">
                                        <Label>Verification Method *</Label>
                                        <select
                                            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        >
                                            {VERIFICATION_METHODS.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </form.Field>
                        </TabsContent>

                        <TabsContent value="pricing" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <form.Field name="discountType">
                                {(field) => (
                                    <div className="grid gap-2">
                                        <Label>Discount Type</Label>
                                        <select
                                            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount ($)</option>
                                            <option value="free">Free</option>
                                            <option value="trial">Free Trial</option>
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
                                            type="number"
                                            step="0.01"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="e.g. 50"
                                        />
                                    </div>
                                )}
                            </form.Field>

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

                            <form.Field name="currency">
                                {(field) => (
                                    <div className="grid gap-2">
                                        <Label>Currency</Label>
                                        <select
                                            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="CAD">CAD ($)</option>
                                            <option value="AUD">AUD ($)</option>
                                        </select>
                                    </div>
                                )}
                            </form.Field>

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
                                            placeholder="https://... (external legal terms)"
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
            </DialogContent>
        </Dialog>
    );
}
