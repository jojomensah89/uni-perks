import { headers } from "next/headers";
import { CategoriesTable } from "@/components/admin/CategoriesTable";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { fetchAPI } from "@/lib/api";

export type ApiCategoryResponse = {
    id: string;
    name: string;
    slug: string;
    icon?: string;
};

export default async function AdminCategoriesPage() {
    // We pass cookies/headers so the backend recognizes the admin session
    const h = await headers();
    const cookie = h.get("cookie") || "";

    // Using fetchAPI (which currently points to /api/categories)
    // Note: If you add an /api/admin/categories endpoint later, change this URL.
    const res = await fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories", {
        headers: {
            "Cookie": cookie
        }
    });

    const categories = res.categories || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage deal categories and their display settings.
                    </p>
                </div>
                <CategoryForm />
            </div>

            <CategoriesTable data={categories} />
        </div>
    );
}
