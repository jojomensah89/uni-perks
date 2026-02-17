# Uni-Perks MCP Server

Model Context Protocol (MCP) server for the Uni-Perks API. Enables AI agents like Claude to search student deals, get deal details, and submit new deal suggestions.

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "uni-perks": {
      "command": "node",
      "args": ["/absolute/path/to/uni-perks/mcp-server/dist/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

For production:

```json
{
  "mcpServers": {
    "uni-perks": {
      "command": "node",
      "args": ["/absolute/path/to/uni-perks/mcp-server/dist/index.js"],
      "env": {
        "API_BASE_URL": "https://api.uni-perks.co"
      }
    }
  }
}
```

Restart Claude Desktop after adding the configuration.

## Available Tools

### `search_deals`

Search for student deals by category, region, or keywords.

**Parameters:**

- `query` (string, optional): Search query
- `category` (string, optional): Category slug (e.g., `tech`, `streaming`)
- `region` (string, optional): Region code (e.g., `US`, `GB`)
- `featured` (boolean, optional): Filter featured deals only
- `limit` (number, optional): Max results (default: 10)

**Example:**

```
Find me tech student deals in the US
```

### `get_deal`

Get detailed information about a specific deal.

**Parameters:**

- `slug` (string, required): Deal slug

**Example:**

```
Get details for the github-pro-student deal
```

### `get_brand`

Get brand information and all associated deals.

**Parameters:**

- `slug` (string, required): Brand slug

**Example:**

```
Show me all Spotify student deals
```

### `list_categories`

Get all available deal categories.

**Example:**

```
What categories of student deals are available?
```

### `submit_deal_suggestion`

Submit a new student deal suggestion for review.

**Parameters:**

- `brandName` (string, required): Brand name
- `dealTitle` (string, required): Deal title
- `description` (string, required): Deal description
- `discountLabel` (string, required): Discount label (e.g., "50% off")
- `claimUrl` (string, required): URL to claim the deal
- `category` (string, optional): Category slug
- `source` (string, optional): `ai` or `user` (default: `ai`)
- `submittedBy` (string, optional): Submitter identifier

**Example:**

```
I found a new student deal: Apple Music offers 3 months free for students at https://apple.com/student
```

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Run
npm start
```

## Environment Variables

- `API_BASE_URL`: Base URL for the Uni-Perks API (default: `http://localhost:3000`)

## License

MIT
