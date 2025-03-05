# Setting up MCP Documentation Server

## Installation

1. Install the package globally:
```bash
npm install -g mcp-documentation-server
```

2. Add the configuration to Claude Desktop:

- Windows: `%APPDATA%\Claude\config.json`
- macOS: `~/Library/Application Support/Claude/config.json`
- Linux: `~/.config/Claude/config.json`

```json
{
  "mcpServers": {
    "documentation": {
      "command": "npx",
      "args": ["-y", "mcp-documentation-server"],
      "env": {
        "BRAVE_API_KEY": "<YOUR_BRAVE_API_KEY>"
      }
    }
  }
}
```

3. Start Claude Desktop

4. Test the installation:
```
Claude, check if the documentation server is running.
```

## Environment Variables

- `BRAVE_API_KEY`: Required. Your Brave Search API key
- `PORT`: Optional. Server port (default: 3000)
- `UPDATE_INTERVAL`: Optional. Documentation update interval in ms (default: 1 hour)
- `CACHE_DURATION`: Optional. Cache duration in ms (default: 24 hours)
- `DEBUG`: Optional. Enable debug mode (default: false)

## Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start in development mode:
```bash
npm run dev
```

## Usage

Once configured, you can use commands like:

```
Claude, search documentation for React hooks
```

```
Claude, analyze this code and suggest improvements...
```

## Troubleshooting

1. Check server status:
```bash
curl http://localhost:3000/api/status
```

2. Enable debug mode:
```json
{
  "env": {
    "DEBUG": "true"
  }
}
```

3. Check logs:
```bash
npm run dev
```