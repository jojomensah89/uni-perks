"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api";

interface TickerSettings {
    messages: string[];
}

export default function AdminSettingsPage() {
    const queryClient = useQueryClient();
    const [tickerText, setTickerText] = useState("");

    const tickerQuery = useQuery({
        queryKey: ["ticker_settings"],
        queryFn: async () => {
            const data = await fetchAPI<TickerSettings>("/api/settings/ticker");
            setTickerText(data.messages.join("\n"));
            return data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (messages: string[]) => {
            return await fetchAPI("/api/admin/settings/ticker", {
                method: "PUT",
                body: JSON.stringify({ messages }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticker_settings"] });
            toast.success("Ticker messages updated!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update ticker");
        },
    });

    const handleSaveTicker = () => {
        const messages = tickerText
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (messages.length === 0) {
            toast.error("Please enter at least one message");
            return;
        }

        updateMutation.mutate(messages);
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Configure site-wide settings and content.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ticker Bar Messages</CardTitle>
                    <CardDescription>
                        Messages displayed in the scrolling ticker at the top of the site. 
                        Enter one message per line. They will cycle in order.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {tickerQuery.isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="ticker-messages">Messages (one per line)</Label>
                                <Textarea
                                    id="ticker-messages"
                                    value={tickerText}
                                    onChange={(e) => setTickerText(e.target.value)}
                                    placeholder={"UNI-PERKS\nNO SIGNUP\n100% VERIFIED\nSTUDENT DEALS"}
                                    rows={6}
                                    className="font-mono"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const original = tickerQuery.data?.messages || [];
                                        setTickerText(original.join("\n"));
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    onClick={handleSaveTicker}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? "Saving..." : "Save Messages"}
                                </Button>
                            </div>

                            <div className="rounded-lg bg-muted p-4">
                                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                <div className="bg-foreground py-2 overflow-hidden rounded">
                                    <div className="whitespace-nowrap font-mono text-xs uppercase tracking-widest text-primary">
                                        {tickerText.split("\n").filter(Boolean).join(" /// ")} /// {tickerText.split("\n").filter(Boolean).join(" /// ")}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
