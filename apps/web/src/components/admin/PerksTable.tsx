"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Perk, Category } from "@/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Star, StarOff, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerksTableProps {
    perks: Array<{
        perk: Perk;
        category: Category | null;
    }>;
}

export function PerksTable({ perks }: PerksTableProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleToggleFeatured = async (perkId: string) => {
        setLoading(perkId);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/perks/${perkId}/feature`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to toggle featured:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async (perkId: string) => {
        if (!confirm('Are you sure you want to delete this perk?')) return;

        setLoading(perkId);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/perks/${perkId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to delete perk:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleExpire = async (perkId: string) => {
        setLoading(perkId);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/perks/${perkId}/expire`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ expirationDate: new Date().toISOString() }),
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to expire perk:', error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {perks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No perks found
                            </TableCell>
                        </TableRow>
                    ) : (
                        perks.map(({ perk, category }) => (
                            <TableRow key={perk.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {perk.isFeatured && (
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        )}
                                        {perk.title}
                                    </div>
                                </TableCell>
                                <TableCell>{perk.company}</TableCell>
                                <TableCell>
                                    {category && (
                                        <Badge variant="secondary">{category.name}</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={perk.isActive ? "default" : "destructive"}
                                        className={cn(!perk.isActive && "bg-red-500")}
                                    >
                                        {perk.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{perk.viewCount}</TableCell>
                                <TableCell className="text-right">{perk.clickCount}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={loading === perk.id}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/perks/${perk.id}/edit`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleFeatured(perk.id)}>
                                                {perk.isFeatured ? (
                                                    <>
                                                        <StarOff className="mr-2 h-4 w-4" />
                                                        Unfeature
                                                    </>
                                                ) : (
                                                    <>
                                                        <Star className="mr-2 h-4 w-4" />
                                                        Feature
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExpire(perk.id)}>
                                                <Clock className="mr-2 h-4 w-4" />
                                                Expire Now
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(perk.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
