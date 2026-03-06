export async function withKV<T>(
    kv: KVNamespace | undefined,
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>
): Promise<T> {
    if (!kv) {
        return fetchFn();
    }

    const cached = await kv.get(key, "json") as T | null;
    if (cached !== null) {
        return cached;
    }

    const fresh = await fetchFn();
    void kv.put(key, JSON.stringify(fresh), { expirationTtl: ttlSeconds });
    return fresh;
}

export async function invalidateKV(kv: KVNamespace | undefined, key: string) {
    if (!kv) return;
    await kv.delete(key);
}
