"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string | null;
    onChange: (key: string) => void;
    folder?: string;
    label?: string;
    className?: string;
    previewClassName?: string;
}

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export function ImageUpload({
    value,
    onChange,
    folder,
    label = "Image",
    className,
    previewClassName,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
        if (!allowedTypes.includes(file.type)) {
            setError("Invalid file type. Allowed: JPEG, PNG, WebP, SVG");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("File too large. Max size: 5MB");
            return;
        }

        setError(null);
        setUploading(true);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        try {
            const formData = new FormData();
            formData.append("file", file);
            if (folder) formData.append("folder", folder);

            const response = await fetch(`${API_URL}/api/upload`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json() as { message?: string };
                throw new Error(errorData.message || "Upload failed");
            }

            const data = await response.json() as { key: string; url: string };
            onChange(data.key);
        } catch (err: any) {
            setError(err.message || "Upload failed");
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange("");
        setPreview(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    // Determine what to show as preview
    const imagePreview = preview || (value ? `${API_URL}/api/images/${value}` : null);

    return (
        <div className={cn("space-y-2", className)}>
            <Label>{label}</Label>

            {imagePreview ? (
                <div className={cn("relative group", previewClassName)}>
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {value && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs text-muted-foreground max-w-[80%] truncate">
                            {value}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                    {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload</p>
                            <p className="text-xs text-muted-foreground/60">JPEG, PNG, WebP, SVG (max 5MB)</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
