import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  discoverNewDeals,
  resolveBrand,
  resolveCategory,
  checkDuplicate,
  createSuggestion,
} from "./discovery.js";
import { CreateSuggestionSchema } from "./sanitize.js";

const server = new McpServer({
  name: "uni-perks-agent",
  version: "1.0.0",
});

/**
 * Tool 1: Fetch and parse a trusted RSS feed.
 */
server.tool(
  "fetch_rss_feed",
  { feedUrl: z.string().url() },
  async ({ feedUrl }) => {
    try {
      const items = await discoverNewDeals(feedUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

/**
 * Tool 2: Resolve brand from DB by name.
 */
server.tool(
  "resolve_brand",
  { name: z.string() },
  async ({ name }) => {
    try {
      const result = await resolveBrand(name);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ brands: result, found: result.length > 0 }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

/**
 * Tool 3: Resolve category from DB by name.
 */
server.tool(
  "resolve_category",
  { name: z.string() },
  async ({ name }) => {
    try {
      const result = await resolveCategory(name);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ categories: result, found: result.length > 0 }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

/**
 * Tool 4: Check if a deal already exists (deduplication).
 */
server.tool(
  "check_duplicate",
  { claimUrl: z.string().url().optional(), title: z.string().optional() },
  async ({ claimUrl, title }) => {
    try {
      if (!claimUrl && !title) {
        throw new Error("Either claimUrl or title is required.");
      }
      const isDuplicate = await checkDuplicate({ claimUrl, title });
      return {
        content: [{ type: "text", text: JSON.stringify({ isDuplicate }, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

/**
 * Tool 5: Create a deal suggestion.
 */
server.tool(
  "create_suggestion",
  CreateSuggestionSchema.shape,
  async (args) => {
    try {
      const [inserted] = await createSuggestion(args);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, id: inserted?.id }, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Start the server using stdio transport
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agent MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
