"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import type { Perk, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface PerkFormProps {
    perk?: Perk;
    categories: Category[];
    mode: "create" | "edit";
}

export function PerkForm({ perk, categories, mode }: PerkFormProps) {
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            title: perk?.title || "",
            slug: perk?.slug || "",
            company: perk?.company || "",
            companyLogo: perk?.companyLogo || "",
            shortDescription: perk?.shortDescription || "",
            longDescription: perk?.longDescription || "",
            categoryId: perk?.categoryId || "",
            valueAmount: perk?.valueAmount?.toString() || "",
            valueCurrency: perk?.valueCurrency || "USD",
            verificationMethod: perk?.verificationMethod || "email",
            eligibilityNote: perk?.eligibilityNote || "",
            claimUrl: perk?.claimUrl || "",
            affiliateUrl: perk?.affiliateUrl || "",
            isFeatured: perk?.isFeatured || false,
            isGlobal: perk?.isGlobal || false,
            region: perk?.region || "",
            regionNotes: perk?.regionNotes || "",
        },
        onSubmit: async ({ value }) => {
            try {
                const url = mode === "create"
                    ? `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/perks`
                    : `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/perks/${perk?.id}`;

                const method = mode === "create" ? "POST" : "PATCH";

                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        ...value,
                        valueAmount: value.valueAmount ? parseFloat(value.valueAmount) : undefined,
                    }),
                });

                if (response.ok) {
                    router.push("/admin/perks");
                    router.refresh();
                } else {
                    const error = await response.json() as { message?: string };
                    alert(`Error: ${error.message || "Failed to save perk"}`);
                }
            } catch (error) {
                console.error("Failed to save perk:", error);
                alert("Failed to save perk. Please try again.");
            }
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Core details about the perk</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form.Field name="title">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="50% off for students"
                                    required
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="slug">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="50-off-students"
                                    required
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="company">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="company">Company *</Label>
                                <Input
                                    id="company"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Spotify"
                                    required
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="companyLogo">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="companyLogo">Company Logo URL</Label>
                                <Input
                                    id="companyLogo"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="categoryId">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Category *</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value || "")}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form.Field name="shortDescription">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="shortDescription">Short Description *</Label>
                                <Textarea
                                    id="shortDescription"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Brief summary of the perk"
                                    rows={3}
                                    required
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="longDescription">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="longDescription">Long Description *</Label>
                                <Textarea
                                    id="longDescription"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Detailed description of the perk"
                                    rows={6}
                                    required
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="eligibilityNote">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="eligibilityNote">Eligibility Note</Label>
                                <Textarea
                                    id="eligibilityNote"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Who is eligible for this perk?"
                                    rows={2}
                                />
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Value & Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="valueAmount">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="valueAmount">Value Amount</Label>
                                    <Input
                                        id="valueAmount"
                                        type="number"
                                        step="0.01"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="99.99"
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="valueCurrency">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="valueCurrency">Currency</Label>
                                    <Input
                                        id="valueCurrency"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="USD"
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="verificationMethod">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="verificationMethod">Verification Method *</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value || "")}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email (.edu)</SelectItem>
                                        <SelectItem value="unidays">UNiDAYS</SelectItem>
                                        <SelectItem value="shierid">SheerID</SelectItem>
                                        <SelectItem value="manual">Manual</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>URLs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form.Field name="claimUrl">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="claimUrl">Claim URL *</Label>
                                <Input
                                    id="claimUrl"
                                    type="url"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="https://example.com/student-discount"
                                    required
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="affiliateUrl">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="affiliateUrl">Affiliate URL</Label>
                                <Input
                                    id="affiliateUrl"
                                    type="url"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="https://example.com/ref/..."
                                />
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Geographic & Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form.Field name="isGlobal">
                        {(field) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isGlobal"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                                />
                                <Label htmlFor="isGlobal">Available Globally</Label>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="region">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="region">Region</Label>
                                <Input
                                    id="region"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="North America, Europe, etc."
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="regionNotes">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor="regionNotes">Region Notes</Label>
                                <Textarea
                                    id="regionNotes"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Additional regional information"
                                    rows={2}
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="isFeatured">
                        {(field) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isFeatured"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                                />
                                <Label htmlFor="isFeatured">Featured Perk</Label>
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button type="submit" disabled={form.state.isSubmitting}>
                    {form.state.isSubmitting ? "Saving..." : mode === "create" ? "Create Perk" : "Update Perk"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/perks")}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
