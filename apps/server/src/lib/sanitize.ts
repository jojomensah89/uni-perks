const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

const HTML_ESCAPE_PATTERN = /[&<>"'`=\/]/g;
const ALLOWED_SEARCH_CHARS_PATTERN = /[^a-zA-Z0-9\s\-_.]/g;
const COLLAPSE_WHITESPACE_PATTERN = /\s+/g;

export function sanitizeHtml(input: string): string {
  return input.replace(
    HTML_ESCAPE_PATTERN,
    (character) => HTML_ESCAPE_MAP[character] ?? character,
  );
}

export function sanitizeSearchQuery(input: string): string {
  const normalized = input.normalize("NFKC");
  const stripped = normalized.replace(ALLOWED_SEARCH_CHARS_PATTERN, " ");
  const collapsed = stripped.replace(COLLAPSE_WHITESPACE_PATTERN, " ").trim();
  return sanitizeHtml(collapsed).slice(0, 200);
}
