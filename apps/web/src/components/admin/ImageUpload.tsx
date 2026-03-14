"use client";

import { useState, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
    value?: string | null;
    onChange: (key: string) => void;
    onFileSelected?: (file: File | null) => void;
    folder?: string;
    label?: string;
    className?: string;
    previewClassName?: string;
    /** If true, uploads immediately on selection. Default: false (deferred — upload on form submit). */
    immediateUpload?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

function getImageUrl(keyOrUrl: string): string {
    if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) return keyOrUrl;
    return `${API_URL}/api/images/${keyOrUrl}`;
}

export function ImageUpload({
    value,
    onChange,
    onFileSelected,
    folder,
    label = "Image",
    className,
    previewClassName,
    immediateUpload = false,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
        if (!allowedTypes.includes(file.type)) return "Invalid file type. Allowed: JPEG, PNG, WebP, SVG";
        if (file.size > 5 * 1024 * 1024) return "File too large. Max size: 5MB";
        return null;
    };

    const uploadFile = useCallback(async (file: File): Promise<string> => {
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
        return data.key;
    }, [folder]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);

        // Create local preview immediately — no upload yet
        const reader = new FileReader();
        reader.onload = (ev) => setLocalPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        if (immediateUpload) {
            // Legacy behavior: upload immediately
            setUploading(true);
            try {
                const key = await uploadFile(file);
                onChange(key);
                setPendingFile(null);
                setUploading(false);
            } catch (err: any) {
                setError(err.message || "Upload failed");
                setLocalPreview(null);
                setUploading(false);
            }
        } else {
            // Deferred: store file, notify parent to upload later
            setPendingFile(file);
            onFileSelected?.(file);
        }
    };

    const handleRemove = () => {
        onChange("");
        setLocalPreview(null);
        setPendingFile(null);
        onFileSelected?.(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    // Expose upload method so parent can call it on form submit
    const triggerUpload = async (): Promise<string | null> => {
        if (!pendingFile) return value || null;
        setUploading(true);
        try {
            const key = await uploadFile(pendingFile);
            onChange(key);
            setPendingFile(null);
            setUploading(false);
            return key;
        } catch (err: any) {
            setError(err.message || "Upload failed");
            setUploading(false);
            return null;
        }
    };

    // biome-ignore lint: expose method via ref-like pattern
    (ImageUpload as any).__triggerUpload = triggerUpload;

    const imagePreview = localPreview || (value ? getImageUrl(value) : null);

    return (
        <div className={cn("space-y-2", className)}>
            <Label>{label}</Label>

            {imagePreview ? (
                <div className={cn("relative group w-full h-48", previewClassName)}>
                    <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg border border-border"
                        unoptimized={true}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {pendingFile && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-amber-500/90 rounded text-xs text-white font-medium">
                            {uploading ? "Uploading..." : "Pending upload"}
                        </div>
                    )}
                    {value && !pendingFile && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs text-muted-foreground max-w-[80%] truncate">
                            {value}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                    {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to select image</p>
                            <p className="text-xs text-muted-foreground/60">JPEG, PNG, WebP, SVG (max 5MB)</p>
                            <p className="text-xs text-muted-foreground/40 mt-1">Uploads when you save the form</p>
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
