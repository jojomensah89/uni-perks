export const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        // Include cookies for authentication
        credentials: 'include',
        // Ensure we don't cache aggressively during dev, or use 'force-cache' for static
        cache: options?.cache || 'no-store',
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; message?: string };
        const message = body.error ?? body.message ?? `${res.status} ${res.statusText}`;
        throw new Error(message);
    }

    return res.json();
}
