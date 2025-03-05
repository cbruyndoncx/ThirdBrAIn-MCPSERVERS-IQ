# MCP Documentation Server Usage Guide

## MCP Functions

The server provides the following MCP functions:

### search_documentation
```typescript
interface SearchParams {
    query: string;          // Required: Search query
    framework?: string;     // Optional: Framework name
    version?: string;      // Optional: Framework version
}
```

Example:
```json
{
    "query": "React hooks guide",
    "framework": "react",
    "version": "18"
}
```

### analyze_code
```typescript
interface CodeAnalysisParams {
    code: string;           // Required: Code to analyze
    language: string;       // Required: Programming language
    framework?: string;     // Optional: Framework name
}
```

Example:
```json
{
    "code": "function test() { ... }",
    "language": "javascript",
    "framework": "react"
}
```

### get_status
No parameters required. Returns server status and metrics.

### get_system_metrics
No parameters required. Returns detailed system metrics.

## Rate Limiting

- Search: 100 requests per minute
- Analysis: 100 requests per minute

## Caching

- Search results: 1 hour
- Analysis results: 24 hours

## Using with Claude Desktop

1. Configure Claude Desktop:
```json
{
    "mcpServers": {
        "documentation": {
            "command": "npx",
            "args": ["-y", "mcp-documentation-server"],
            "env": {
                "BRAVE_API_KEY": "<YOUR_API_KEY>"
            }
        }
    }
}
```

2. Example prompts:
```
Claude, search documentation for React hooks best practices
```

```
Claude, analyze this code for performance issues:

function slowFunction() { ... }
```

## Monitoring

Check server status:
```bash
curl http://localhost:3000/status
```

Get system metrics:
```bash
curl http://localhost:3000/metrics
```

## Error Handling

The server returns standardized error responses:
```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Error description"
    }
}
```

Common error codes:
- VALIDATION_ERROR: Invalid parameters
- RATE_LIMIT_EXCEEDED: Too many requests
- SEARCH_ERROR: Error during search
- ANALYSIS_ERROR: Error during code analysis

## Environment Variables

- `BRAVE_API_KEY`: Required. Your Brave Search API key
- `PORT`: Optional. Server port (default: 3000)
- `UPDATE_INTERVAL`: Optional. Update interval in ms (default: 3600000)
- `CACHE_DURATION`: Optional. Cache duration in ms (default: 86400000)
- `DEBUG`: Optional. Enable debug mode (default: false)
- `LOG_LEVEL`: Optional. Logging level (default: info)

## Development

1. Clone and install:
```bash
git clone https://github.com/yourusername/mcp-documentation-server.git
cd mcp-documentation-server
npm install
```

2. Run tests:
```bash
npm test
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```