import { headers } from "next/headers";
import { UsersTable } from "@/components/admin/UsersTable";
import { fetchAPI } from "@/lib/api";

export type ApiUserResponse = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    role: string;
    banned?: boolean;
    banReason?: string;
    createdAt: number;
};

export default async function AdminUsersPage() {
    const h = await headers();
    const cookie = h.get("cookie") || "";

    // The better-auth admin plugin typically comes with list users admin endpoint
    // This assumes we implement an overarching route in server for it,
    // or we fetch using the better-auth client directly
    const res = await fetchAPI<{ users: ApiUserResponse[] }>("/api/admin/users", {
        headers: { "Cookie": cookie }
    }).catch(() => ({ users: [] })); // Fallback if API missing

    const users = res.users || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user accounts, roles, and ban statuses.
                    </p>
                </div>
            </div>

            <UsersTable data={users} />
        </div>
    );
}
