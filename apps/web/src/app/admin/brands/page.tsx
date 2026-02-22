import { headers } from "next/headers";
import { BrandsTable } from "@/components/admin/BrandsTable";
import { BrandForm } from "@/components/admin/BrandForm";
import { fetchAPI } from "@/lib/api";

export type ApiBrandResponse = {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    website?: string;
    isVerified?: boolean;
    logoUrl?: string;
};

export default async function AdminBrandsPage() {
    const h = await headers();
    const cookie = h.get("cookie") || "";

    const res = await fetchAPI<{ brands: ApiBrandResponse[] }>("/api/brands", {
        headers: {
            "Cookie": cookie
        }
    });

    const brands = res.brands || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage partner brands and companies.
                    </p>
                </div>
                <BrandForm />
            </div>

            <BrandsTable data={brands} />
        </div>
    );
}
