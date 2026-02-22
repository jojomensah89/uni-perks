"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { ApiUserResponse } from "@/app/admin/users/page";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ShieldIcon, BanIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function UsersTable({ data }: { data: ApiUserResponse[] }) {
    const router = useRouter();

    const handleSetRole = async (userId: string, role: "user" | "admin") => {
        try {
            await authClient.admin.setRole({
                userId,
                role,
            });
            toast.success(`User role updated to ${role}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update role");
        }
    };

    const handleBanUser = async (userId: string, isBanned: boolean) => {
        try {
            if (isBanned) {
                await authClient.admin.unbanUser({ userId });
                toast.success("User unbanned successfully");
            } else {
                await authClient.admin.banUser({
                    userId,
                    banReason: "Admin action",
                });
                toast.success("User banned successfully");
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to toggle ban status");
        }
    };

    const columns: ColumnDef<ApiUserResponse>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string;
                return (
                    <Badge variant={role === "admin" ? "default" : "secondary"}>
                        {role}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "banned",
            header: "Status",
            cell: ({ row }) => {
                const isBanned = row.getValue("banned") as boolean;
                return isBanned ? (
                    <Badge variant="destructive">Banned</Badge>
                ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(user.id)}
                            >
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => handleSetRole(user.id, user.role === "admin" ? "user" : "admin")}>
                                <ShieldIcon className="mr-2 h-4 w-4" />
                                {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleBanUser(user.id, !!user.banned)}
                            >
                                <BanIcon className="mr-2 h-4 w-4" />
                                {user.banned ? "Unban User" : "Ban User"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <div className="w-full">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
