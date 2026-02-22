import { headers } from "next/headers";
import { DealsTable } from "@/components/admin/DealsTable";
import { DealForm } from "@/components/admin/DealForm";
import { fetchAPI } from "@/lib/api";
import type { ApiBrandResponse } from "@/app/admin/brands/page";
import type { ApiCategoryResponse } from "@/app/admin/categories/page";

export type ApiDealResponse = {
    id: string;
    title: string;
    slug: string;
    discountType: string;
    discountValue: string;
    shortDescription?: string;
    isActive?: boolean;
    brand: Pick<ApiBrandResponse, "id" | "name">;
    category: Pick<ApiCategoryResponse, "id" | "name">;
};

export default async function AdminDealsPage() {
    const h = await headers();
    const cookie = h.get("cookie") || "";

    const [dealsRes, brandsRes, categoriesRes] = await Promise.all([
        fetchAPI<{ deals: ApiDealResponse[] }>("/api/admin/deals", {
            headers: { "Cookie": cookie }
        }),
        fetchAPI<{ brands: ApiBrandResponse[] }>("/api/brands", {
            headers: { "Cookie": cookie }
        }),
        fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories", {
            headers: { "Cookie": cookie }
        })
    ]);

    const deals = dealsRes.deals || [];
    const brands = brandsRes.brands || [];
    const categories = categoriesRes.categories || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your exclusive university perks and discounts.
                    </p>
                </div>
                {/* 
                  We pass brands and categories to the form 
                  so it can populate select dropdowns 
                */}
                <DealForm brands={brands} categories={categories} />
            </div>

            <DealsTable data={deals} />
        </div>
    );
}
