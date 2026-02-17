#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

const server = new Server(
    {
        name: 'uni-perks',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'search_deals',
                description: 'Search for student deals by category, region, or keywords. Returns a list of matching deals with brand info, discount labels, and claim URLs.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query to match against deal titles and descriptions'
                        },
                        category: {
                            type: 'string',
                            description: 'Category slug to filter by (e.g., tech, streaming, food)'
                        },
                        region: {
                            type: 'string',
                            description: 'Region code to filter by (e.g., US, GB, CA)'
                        },
                        featured: {
                            type: 'boolean',
                            description: 'If true, only return featured deals'
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results to return',
                            default: 10
                        },
                    },
                },
            },
            {
                name: 'get_deal',
                description: 'Get detailed information about a specific student deal including full description, requirements, and verification steps.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slug: {
                            type: 'string',
                            description: 'Deal slug (URL-friendly identifier)',
                        },
                    },
                    required: ['slug'],
                },
            },
            {
                name: 'get_brand',
                description: 'Get brand information and all associated student deals for that brand.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        slug: {
                            type: 'string',
                            description: 'Brand slug (URL-friendly identifier)',
                        },
                    },
                    required: ['slug'],
                },
            },
            {
                name: 'list_categories',
                description: 'Get all available deal categories (e.g., tech, streaming, food, fashion).',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'submit_deal_suggestion',
                description: 'Submit a new student deal suggestion for review. Use this when you discover a new student discount that should be added to the database.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        brandName: {
                            type: 'string',
                            description: 'Name of the brand offering the discount'
                        },
                        dealTitle: {
                            type: 'string',
                            description: 'Title of the deal (e.g., "50% off for students")'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of what the deal offers'
                        },
                        discountLabel: {
                            type: 'string',
                            description: 'Short label for the discount (e.g., "50% off", "Free for 6 months")'
                        },
                        claimUrl: {
                            type: 'string',
                            description: 'URL where students can claim the deal'
                        },
                        category: {
                            type: 'string',
                            description: 'Category slug (optional, e.g., tech, streaming)'
                        },
                        source: {
                            type: 'string',
                            enum: ['ai', 'user'],
                            description: 'Source of the suggestion',
                            default: 'ai'
                        },
                        submittedBy: {
                            type: 'string',
                            description: 'Name or identifier of the submitter (optional)'
                        },
                    },
                    required: ['brandName', 'dealTitle', 'description', 'discountLabel', 'claimUrl'],
                },
            },
        ],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
        switch (name) {
            case 'search_deals': {
                const params = new URLSearchParams();
                if (args.query) params.append('search', args.query as string);
                if (args.category) params.append('category', args.category as string);
                if (args.region) params.append('region', args.region as string);
                if (args.featured) params.append('featured', 'true');
                params.append('limit', String(args.limit || 10));

                const response = await fetch(`${API_BASE}/api/deals?${params}`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                };
            }

            case 'get_deal': {
                const response = await fetch(`${API_BASE}/api/deals/${args.slug}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({ error: 'Deal not found' }, null, 2),
                                },
                            ],
                            isError: true,
                        };
                    }
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                };
            }

            case 'get_brand': {
                const response = await fetch(`${API_BASE}/api/brands/${args.slug}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({ error: 'Brand not found' }, null, 2),
                                },
                            ],
                            isError: true,
                        };
                    }
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                };
            }

            case 'list_categories': {
                const response = await fetch(`${API_BASE}/api/categories`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                };
            }

            case 'submit_deal_suggestion': {
                const response = await fetch(`${API_BASE}/api/suggestions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(args),
                });

                if (!response.ok) {
                    const error = await response.json();
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({ error: error.message || 'Submission failed' }, null, 2),
                            },
                        ],
                        isError: true,
                    };
                }

                const data = await response.json();

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    }, null, 2),
                },
            ],
            isError: true,
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Uni-Perks MCP server running on stdio');
}

main().catch(console.error);
