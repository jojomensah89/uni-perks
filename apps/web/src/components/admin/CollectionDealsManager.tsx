"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { X, Plus, GripVertical, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiCollectionResponse } from "@/app/admin/collections/page";

interface DealInCollection {
    deal: {
        id: string;
        title: string;
        slug: string;
        discountLabel: string | null;
        discountValue: number;
        discountType: string;
        isFeatured: boolean;
        isActive: boolean;
    };
    brand: { id: string; name: string } | null;
    category: { id: string; name: string } | null;
    displayOrder: number;
}

interface CollectionDealsManagerProps {
    collection: ApiCollectionResponse;
    onClose: () => void;
}

export function CollectionDealsManager({ collection, onClose }: CollectionDealsManagerProps) {
    const queryClient = useQueryClient();
    const [comboboxOpen, setComboboxOpen] = useState(false);
    const [selectedDealId, setSelectedDealId] = useState("");

    // Fetch collection's current deals
    const collectionDealsQuery = useQuery({
        queryKey: ["admin_collection_deals", collection.id],
        queryFn: async () => {
            const res = await fetchAPI<{ collection: ApiCollectionResponse; deals: DealInCollection[] }>(
                `/api/admin/collections/${collection.id}`
            );
            return res;
        },
    });

    // Fetch all available deals
    const allDealsQuery = useQuery({
        queryKey: ["admin_deals"],
        queryFn: () => fetchAPI<{ deals: Array<{ deal: { id: string; title: string }; brand: { name: string } | null }> }>("/api/admin/deals"),
    });

    // Add deal to collection
    const addDealMutation = useMutation({
        mutationFn: (dealId: string) =>
            fetchAPI(`/api/admin/collections/${collection.id}/deals`, {
                method: "POST",
                body: JSON.stringify({ dealId, displayOrder: 0 }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_collection_deals", collection.id] });
            setSelectedDealId("");
            setComboboxOpen(false);
        },
    });

    // Remove deal from collection
    const removeDealMutation = useMutation({
        mutationFn: (dealId: string) =>
            fetchAPI(`/api/admin/collections/${collection.id}/deals/${dealId}`, {
                method: "DELETE",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_collection_deals", collection.id] });
        },
    });

    // Update display order
    const updateOrderMutation = useMutation({
        mutationFn: (orders: Array<{ dealId: string; displayOrder: number }>) =>
            fetchAPI(`/api/admin/collections/${collection.id}/deals/reorder`, {
                method: "PUT",
                body: JSON.stringify({ orders }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_collection_deals", collection.id] });
        },
    });

    const currentDeals = collectionDealsQuery.data?.deals || [];
    const allDeals = allDealsQuery.data?.deals || [];

    // Filter deals not already in collection
    const currentDealIds = new Set(currentDeals.map((d) => d.deal.id));
    const availableDeals = allDeals.filter((d) => !currentDealIds.has(d.deal.id));

    const selectedDeal = allDeals.find((d) => d.deal.id === selectedDealId);

    const handleOrderChange = (dealId: string, newOrder: number) => {
        const orders = currentDeals.map((d) => ({
            dealId: d.deal.id,
            displayOrder: d.deal.id === dealId ? newOrder : d.displayOrder,
        }));
        updateOrderMutation.mutate(orders);
    };

    const handleAddDeal = () => {
        if (selectedDealId) {
            addDealMutation.mutate(selectedDealId);
        }
    };

    const isLoading = collectionDealsQuery.isLoading || allDealsQuery.isLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">{collection.name}</h3>
                <p className="text-sm text-muted-foreground">Manage deals in this collection</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* Add Deal Section */}
                <div className="space-y-3">
                    <Label>Add Deal to Collection</Label>
                    <div className="flex gap-2">
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="flex-1 justify-between"
                                    >
                                        {selectedDeal
                                            ? `${selectedDeal.deal.title} (${selectedDeal.brand?.name || "No brand"})`
                                            : "Select a deal..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search deals..." />
                                    <CommandList>
                                        <CommandEmpty>No deals found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableDeals.map((d) => (
                                                <CommandItem
                                                    key={d.deal.id}
                                                    value={`${d.deal.title} ${d.brand?.name || ""}`}
                                                    onSelect={() => {
                                                        setSelectedDealId(d.deal.id === selectedDealId ? "" : d.deal.id);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedDealId === d.deal.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <span className="flex-1 truncate">{d.deal.title}</span>
                                                    {d.brand && (
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            ({d.brand.name})
                                                        </span>
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Button
                            size="default"
                            disabled={!selectedDealId || addDealMutation.isPending}
                            onClick={handleAddDeal}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                        </Button>
                    </div>
                </div>

                {/* Current Deals List */}
                <div className="space-y-3">
                    <Label>Current Deals ({currentDeals.length})</Label>
                    {currentDeals.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg">
                            No deals in this collection yet
                        </p>
                    ) : (
                        <div className="border rounded-lg divide-y">
                            {currentDeals.map((item) => (
                                <div
                                    key={item.deal.id}
                                    className="flex items-center gap-3 p-3"
                                >
                                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.deal.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {item.brand?.name || "No brand"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Input
                                            type="number"
                                            className="w-16 h-8 text-center"
                                            value={item.displayOrder}
                                            onChange={(e) =>
                                                handleOrderChange(item.deal.id, parseInt(e.target.value) || 0)
                                            }
                                            disabled={updateOrderMutation.isPending}
                                        />
                                        <Badge variant="outline" className="text-xs">
                                            Order
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => removeDealMutation.mutate(item.deal.id)}
                                            disabled={removeDealMutation.isPending}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
                <Button variant="outline" onClick={onClose}>
                    Done
                </Button>
            </div>
        </div>
    );
}
