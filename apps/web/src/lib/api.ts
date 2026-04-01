import { toast } from 'sonner';

export const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

/**
 * Result type for safe API calls
 */
export type ApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Fetch wrapper for API calls.
 * @param path - API path (e.g. '/api/deals')
 * @param options - Standard fetch options
 * @param silent - If true, suppresses the automatic error toast (caller handles the error)
 */
export async function fetchAPI<T>(
    path: string,
    options?: RequestInit,
    silent = false,
): Promise<T> {
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
        cache: options?.cache || 'no-store',
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; message?: string };
        const message = body.error ?? body.message ?? `${res.status} ${res.statusText}`;
        if (!silent) {
            toast.error(message, {
                description: `HTTP ${res.status}`,
                duration: 5000,
            });
        }
        throw new Error(message);
    }

    return res.json();
}

/**
 * Safe API wrapper that doesn't throw - returns result object instead.
 * Use this for Server Components where throwing would crash the page.
 */
export async function fetchAPISafe<T>(
    path: string,
    options?: RequestInit,
): Promise<ApiResult<T>> {
    try {
        const data = await fetchAPI<T>(path, options, true);
        return { success: true, data };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
    }
}
