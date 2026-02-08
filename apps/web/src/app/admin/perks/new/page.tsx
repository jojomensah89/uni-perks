import { fetchAPI } from "@/lib/api";
import type { Category } from "@/types";
import { PerkForm } from "@/components/admin/PerkForm";

export default async function NewPerkPage() {
    const categories = await fetchAPI<Category[]>("api/categories");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Perk</h1>
                <p className="text-muted-foreground mt-2">
                    Add a new student perk to the platform
                </p>
            </div>

            <PerkForm categories={categories} mode="create" />
        </div>
    );
}
