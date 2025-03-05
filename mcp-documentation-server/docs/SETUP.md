   - Connection refused: Ensure server is running
   - API key issues: Verify BRAVE_API_KEY in .env
   - Rate limiting: Check current limits with /api/metrics

4. If issues persist:
   - Enable debug mode in .env: `DEBUG=true`
   - Check server logs in logs/error.log
   - Verify network connectivity
   - Ensure all dependencies are installed

## Development

1. Start in development mode:
```bash
npm run dev
```

2. Watch logs:
```bash
tail -f logs/combined.log
```

3. Run tests:
```bash
npm test
```

## API Documentation

### Search Documentation

`POST /api/search`

Request:
```json
{
    "query": "string",
    "framework": "string",
    "version": "string"
}
```

Response:
```json
{
    "success": true,
    "results": [
        {
            "title": "string",
            "url": "string",
            "description": "string",
            "type": "string",
            "relevance": "number"
        }
    ]
}
```

### Analyze Code

`POST /api/analyze`

Request:
```json
{
    "code": "string",
    "language": "string",
    "framework": "string"
}
```

Response:
```json
{
    "success": true,
    "analysis": {
        "suggestions": [],
        "patterns": [],
        "metrics": {}
    }
}
```

### Get Status

`GET /api/status`

Response:
```json
{
    "status": "string",
    "version": "string",
    "uptime": "number",
    "metrics": {},
    "cache": {},
    "rateLimits": {}
}
```

### Get Metrics

`GET /api/metrics`

Response:
```json
{
    "process": {},
    "metrics": {},
    "health": {},
    "cache": {},
    "rateLimits": {}
}
```

## Rate Limits

- Search: 100 requests per minute
- Analysis: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1633027200
```

## Caching

- Search results: 1 hour TTL
- Analysis results: 24 hours TTL

Cache headers:
```
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```