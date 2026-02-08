import { fetchAPI } from "@/lib/api";
import type { Perk, Category } from "@/types";
import { PerksTable } from "@/components/admin/PerksTable";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface AdminPerksResponse {
    perks: Array<{
        perk: Perk;
        category: Category | null;
    }>;
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}

export default async function AdminPerksPage() {
    let data: AdminPerksResponse | null = null;

    try {
        data = await fetchAPI<AdminPerksResponse>("api/admin/perks", {
            cache: "no-store",
        });
    } catch (error) {
        console.error("Failed to fetch perks:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Perks Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage all perks, toggle featured status, and more
                    </p>
                </div>
                <Link href="/admin/perks/new" className={buttonVariants()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Perk
                </Link>
            </div>

            {data?.perks ? (
                <PerksTable perks={data.perks} />
            ) : (
                <div className="rounded-md border p-8 text-center text-muted-foreground">
                    Failed to load perks. Make sure you're logged in as an admin.
                </div>
            )}
        </div>
    );
}
