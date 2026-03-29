/**
 * Hardcoded allowlist of trusted RSS feeds for student deals.
 * For security, only these feeds are permitted for polling.
 */
export const TRUSTED_FEEDS = [
  {
    name: "GitHub Education",
    url: "https://github.blog/category/education/feed/",
    type: "tech",
  },
  {
    name: "JetBrains Blog",
    url: "https://blog.jetbrains.com/feed/",
    type: "tech",
  },
  {
    name: "Figma Blog",
    url: "https://www.figma.com/blog/rss.xml",
    type: "tech",
  },
  {
    name: "Notion Blog",
    url: "https://www.notion.so/blog/rss.xml",
    type: "tech",
  },
  {
    name: "Product Hunt",
    url: "https://www.producthunt.com/feed",
    type: "discovery",
  },
];

export type Feed = (typeof TRUSTED_FEEDS)[number];
