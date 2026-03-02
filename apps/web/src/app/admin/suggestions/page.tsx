"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Check, X, Clock, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAPI } from "@/lib/api";
import { toast } from "sonner";

type SuggestionStatus = "pending" | "approved" | "rejected";

interface DealSuggestion {
    id: string;
    brandName: string;
    dealTitle: string;
    description: string;
    discountLabel: string;
    claimUrl: string;
    category?: string;
    source: "ai" | "user";
    status: SuggestionStatus;
    submittedBy?: string;
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
}

export default function AdminSuggestionsPage() {
    const queryClient = useQueryClient();

    const suggestionsQuery = useQuery({
        queryKey: ["admin_suggestions"],
        queryFn: async () => {
            try {
                return await fetchAPI<{ suggestions: DealSuggestion[] }>("/api/admin/suggestions");
            } catch {
                return { suggestions: [] };
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status, rejectionReason }: { id: string; status: SuggestionStatus; rejectionReason?: string }) =>
            fetchAPI(`/api/admin/suggestions/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status, rejectionReason }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_suggestions"] });
            toast.success("Suggestion updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update suggestion");
        },
    });

    const handleApprove = (id: string) => {
        updateMutation.mutate({ id, status: "approved" });
    };

    const handleReject = (id: string) => {
        updateMutation.mutate({ id, status: "rejected", rejectionReason: "Admin rejected" });
    };

    const suggestions = suggestionsQuery.data?.suggestions || [];
    const isLoading = suggestionsQuery.isLoading;

    const getStatusBadge = (status: SuggestionStatus) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-primary">Approved</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Deal Suggestions</h1>
                <p className="text-muted-foreground mt-1">
                    Review and manage community-submitted deal suggestions.
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : suggestions.length === 0 ? (
                <div className="border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No suggestions found.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        User-submitted deals will appear here for review.
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Brand</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suggestions.map((suggestion) => (
                                <TableRow key={suggestion.id}>
                                    <TableCell className="font-medium">{suggestion.brandName}</TableCell>
                                    <TableCell>{suggestion.dealTitle}</TableCell>
                                    <TableCell>{suggestion.discountLabel}</TableCell>
                                    <TableCell>{suggestion.category || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{suggestion.source}</Badge>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                                    <TableCell>
                                        {suggestion.status === "pending" ? (
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleApprove(suggestion.id)}
                                                    className="h-8 w-8 p-0 text-primary hover:text-primary"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleReject(suggestion.id)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-md">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.open(suggestion.claimUrl, "_blank")}>
                                                        View Claim URL
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateMutation.mutate({ id: suggestion.id, status: "pending" })}>
                                                        Reset to Pending
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
