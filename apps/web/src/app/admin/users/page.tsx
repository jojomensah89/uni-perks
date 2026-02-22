"use client";

import { useQuery } from "@tanstack/react-query";
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

export default function AdminUsersPage() {
    const usersQuery = useQuery({
        queryKey: ["admin_users"],
        queryFn: async () => {
            // Note: Since this fetch accesses admin-only info, our updated 
            // setup handles cookies automatically in the browser fetch
            try {
                return await fetchAPI<{ users: ApiUserResponse[] }>("/api/admin/users");
            } catch (error) {
                // Fallback if API missing
                return { users: [] };
            }
        },
    });

    if (usersQuery.isLoading) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading users...</p>
            </div>
        );
    }

    if (usersQuery.isError) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <p className="text-destructive font-semibold">Failed to load users.</p>
                <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
            </div>
        );
    }

    const users = usersQuery.data?.users || [];

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
