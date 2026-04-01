import Parser from "rss-parser";

const parser = new Parser({
  timeout: 5000, // 5s timeout
  headers: {
    "User-Agent": "Uni-Perks-Agent/1.0",
  },
});

export interface DecodedEntry {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  guid?: string;
}

/**
 * Fetches and parses an RSS feed securely.
 * Enforces HTTPS and basic response size protection.
 */
export async function fetchAndParseFeed(url: string): Promise<DecodedEntry[]> {
  if (!url.startsWith("https://")) {
    throw new Error("Only HTTPS feeds are allowed for security.");
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }

    // Check content length if available
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      throw new Error("Feed too large (> 1MB). Rejected for security.");
    }

    const xml = await response.text();
    const feed = await parser.parseString(xml);

    return feed.items.map((item) => ({
      title: item.title || "No Title",
      link: item.link || "",
      pubDate: item.pubDate || new Date().toISOString(),
      content: item.contentSnippet || item.content || "",
      guid: item.guid,
    }));
  } catch (error) {
    console.error(`Error parsing feed ${url}:`, error);
    throw error;
  }
}
