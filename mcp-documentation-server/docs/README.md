# Documentation Server

A REST API server for documentation search and code analysis.

## Features

- Documentation search using Brave Search
- Code analysis and suggestions
- Rate limiting
- Response caching
- Metrics and monitoring

## API Endpoints

- `POST /api/search` - Search documentation
- `POST /api/analyze` - Analyze code
- `GET /api/status` - Server status
- `GET /api/metrics` - System metrics
- `GET /health` - Health check

## Usage

1. Install dependencies:
```bash
npm install
```

2. Start server:
```bash
npm start
```

## Development

1. Run in development mode:
```bash
npm run dev
```

2. Run tests:
```bash
npm test
```

## Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `BRAVE_API_KEY` - Brave Search API key
- `UPDATE_INTERVAL` - Metrics update interval (default: 1 hour)
- `CACHE_DURATION` - Cache TTL (default: 24 hours)
- `DEBUG` - Enable debug mode (default: false)

## Integration

To integrate with Claude Desktop, add this to Claude's config:

```json
{
  "mcpServers": {
    "documentation": {
      "url": "http://localhost:3000",
      "functions": [
        {
          "name": "search_documentation",
          "endpoint": "/api/search",
          "method": "POST"
        },
        {
          "name": "analyze_code",
          "endpoint": "/api/analyze",
          "method": "POST"
        }
      ]
    }
  }
}
```

## License

MIT