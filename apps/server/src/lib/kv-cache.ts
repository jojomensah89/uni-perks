import { logInfo } from "./logger";

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
        logInfo("kv-cache", "cache hit", { key });
        return cached;
    }

    logInfo("kv-cache", "cache miss", { key });
    const fresh = await fetchFn();
    void kv.put(key, JSON.stringify(fresh), { expirationTtl: ttlSeconds });
    return fresh;
}

export async function invalidateKV(kv: KVNamespace | undefined, key: string) {
    if (!kv) return;
    await kv.delete(key);
}
