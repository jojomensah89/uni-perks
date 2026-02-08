"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function SearchInput({ placeholder = "Search perks...", className }: { placeholder?: string, className?: string }) {
    const [searchParam, setSearchParam] = useQueryState('search', parseAsString);

    // Local state for immediate UI feedback
    const [term, setTerm] = useState(searchParam || "");
    const debouncedTerm = useDebounce(term, 300);

    // Sync debounced value to URL
    useEffect(() => {
        setSearchParam(debouncedTerm || null);
    }, [debouncedTerm, setSearchParam]);

    // Sync URL changes back to local state (e.g., when user clicks "Clear Filters")
    useEffect(() => {
        if (searchParam !== term && searchParam !== debouncedTerm) {
            setTerm(searchParam || "");
        }
    }, [searchParam]);

    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-9 bg-background h-10 w-full"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
        </div>
    );
}
