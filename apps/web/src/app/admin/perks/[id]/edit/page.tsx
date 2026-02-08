import { fetchAPI } from "@/lib/api";
import type { Perk, Category } from "@/types";
import { PerkForm } from "@/components/admin/PerkForm";
import { notFound } from "next/navigation";

interface EditPerkPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPerkPage({ params }: EditPerkPageProps) {
    const { id } = await params;

    let perkData: { perk: Perk; category: Category | null } | null = null;
    let categories: Category[] = [];

    try {
        [perkData, categories] = await Promise.all([
            fetchAPI<{ perk: Perk; category: Category | null }>(`api/admin/perks/${id}`),
            fetchAPI<Category[]>("api/categories"),
        ]);
    } catch (error) {
        console.error("Failed to fetch perk:", error);
        notFound();
    }

    if (!perkData?.perk) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Perk</h1>
                <p className="text-muted-foreground mt-2">
                    Update perk details for {perkData.perk.title}
                </p>
            </div>

            <PerkForm perk={perkData.perk} categories={categories} mode="edit" />
        </div>
    );
}
