import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { TRUSTED_FEEDS } from "./feeds.js";
import { captureAgentEvent, shutdownPosthog, initPosthog } from "./posthog.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface RunAgentOptions {
  anthropicApiKey: string;
  posthogApiKey?: string;
  posthogHost?: string;
}

/**
 * Orchestrates the AI agent.
 * Connects to the local MCP server and runs the deal discovery loop.
 */
export async function runDiscoveryAgent(options: RunAgentOptions) {
  console.log("Starting Uni-Perks Deal Discovery Agent...");
  
  if (options.posthogApiKey) {
    initPosthog(options.posthogApiKey, options.posthogHost);
  }

  await captureAgentEvent("agent_run_started", {
    timestamp: new Date().toISOString(),
  });

  // 1. Setup MCP Client
  // We spawn the MCP server as a subprocess
  const transport = new StdioClientTransport({
    command: "bun",
    args: [path.join(__dirname, "server.ts")],
  });

  const client = new Client(
    { name: "uni-perks-agent-runtime", version: "1.0.0" },
    { capabilities: { } }
  );

  await client.connect(transport);

  const tools = await client.listTools();
  console.log(`Connected to MCP server. Discovered ${tools.tools.length} tools.`);

  // 2. Wrap MCP tools for Vercel AI SDK
  const sdkTools: any = {};
  for (const tool of tools.tools) {
    sdkTools[tool.name] = {
      description: tool.description,
      parameters: tool.inputSchema,
      execute: async (args: any) => {
        console.log(`Tool call: ${tool.name}`, args);
        
        // Track tool specific events
        if (tool.name === 'fetch_rss_feed') {
          await captureAgentEvent("agent_rss_check", { feed_url: args.feedUrl });
        } else if (tool.name === 'create_suggestion') {
          await captureAgentEvent("agent_deal_created", {
            brand_name: args.brandName,
            deal_title: args.dealTitle,
            confidence: args.confidenceScore
          });
        }

        const result = (await client.callTool({
            name: tool.name,
            arguments: args
        })) as any;

        if (result.isError) {
          const message = result.content?.[0]?.type === "text"
            ? result.content[0].text
            : `Tool ${tool.name} failed`;
          throw new Error(message);
        }

        const textResult = result.content?.find((part: { type: string; text?: string }) => part.type === "text")?.text;
        if (!textResult) {
          return result.content;
        }

        try {
          return JSON.parse(textResult);
        } catch {
          return { text: textResult };
        }
      },
    };
  }

  const anthropic = createAnthropic({
    apiKey: options.anthropicApiKey,
  });

  // 3. Run the Agent Loop
  console.log("Running agent loop...");
  try {
    const { text, usage } = await generateText({
      model: anthropic("claude-3-5-sonnet-latest"), 
      tools: sdkTools,
      maxSteps: 30,
      system: `
        You are a deal-discovery agent for uni-perks.com.
        Your mission is to find genuine student discounts and university-specific perks from trusted RSS feeds.
        
        CRITICAL RULES:
        1. ONLY process feeds from the trusted list: ${TRUSTED_FEEDS.map(f => f.url).join(", ")}.
        2. ONLY create suggestions for deals that explicitly target STUDENTS or UNIVERSITIES.
        3. For every potential deal:
           a. Check if it already exists using check_duplicate (by URL and title).
           b. If it's new, resolve the brand name using resolve_brand to see if we have an existing brand ID.
           c. Resolve the category using resolve_category.
           d. Create a suggestion with a high confidenceScore (0.8+) only if it's clearly a student deal.
        4. Do not create more than 5 suggestions in a single run to avoid floods.
        5. Be concise in your deal descriptions.
        6. If you find a deal for a brand we don't have, create the suggestion anyway with resolvedBrandId as undefined.
      `,
      prompt: "Go through all the trusted RSS feeds and find any new student deals since the last run.",
    });

    console.log("Agent run completed.");
    console.log(`Usage: ${usage ? JSON.stringify(usage) : "unknown"}`);
    console.log(`Summary: ${text}`);
    
    await captureAgentEvent("agent_run_completed", {
      usage,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Agent run failed:", error);
    await captureAgentEvent("agent_run_failed", {
      error: error.message,
    });
    throw error;
  } finally {
    await client.close();
    await shutdownPosthog();
  }
}

const isMain = import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error("ANTHROPIC_API_KEY environment variable is required");
        process.exit(1);
    }
    runDiscoveryAgent({
        anthropicApiKey: apiKey,
        posthogApiKey: process.env.POSTHOG_API_KEY,
        posthogHost: process.env.POSTHOG_HOST
    }).catch(console.error);
}
