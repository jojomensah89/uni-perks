"use client"

import * as React from "react"
import { Globe, Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const countries = [
    { value: "us", label: "United States", flag: "🇺🇸" },
    { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
    { value: "ca", label: "Canada", flag: "🇨🇦" },
    { value: "au", label: "Australia", flag: "🇦🇺" },
    { value: "de", label: "Germany", flag: "🇩🇪" },
    { value: "fr", label: "France", flag: "🇫🇷" },
]

export function CountrySelector() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("us")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger >
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[180px] justify-between"
                >
                    {value
                        ? <span className="flex items-center gap-2">{countries.find((country) => country.value === value)?.flag} {countries.find((country) => country.value === value)?.label}</span>
                        : "Select country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup heading="Popular">
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.value}
                                    value={country.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === country.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="mr-2">{country.flag}</span>
                                    {country.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
