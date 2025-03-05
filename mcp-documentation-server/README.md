# MCP Documentation Server

A smart documentation server that provides AI-assisted code improvement and documentation management through Claude Desktop integration.

## Features

- **AI Documentation Guide**: Maintains and updates documentation knowledge base
- **AI Code Assistant**: Analyzes and improves code quality
- **Framework Support**: 
  - React.js
  - Next.js (with App Router)
  - Python
  - Vue.js
  - Angular
  - Node.js
- **Brave Search Integration**: Smart documentation search and retrieval
- **Learning System**: Improves suggestions over time

## Quick Start

1. Install the package:
```bash
npm install -g mcp-documentation-server
```

2. Configure Claude Desktop (config.json):
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

3. Start using with Claude:
```
Claude, search documentation for Next.js App Router
```

For detailed setup instructions, see [Claude Desktop Setup Guide](docs/CLAUDE_DESKTOP_SETUP.md)

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/mahawi1992/mcp-documentation-server.git
cd mcp-documentation-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file:
```env
PORT=3000
UPDATE_INTERVAL=3600000
CACHE_DURATION=86400000
BRAVE_API_KEY=your_brave_api_key
```

4. Start the development server:
```bash
npm run dev
```

## Documentation

- [Usage Guide](docs/USAGE.md)
- [Claude Desktop Setup](docs/CLAUDE_DESKTOP_SETUP.md)
- [API Documentation](docs/API.md)
- [Contributing Guide](CONTRIBUTING.md)

## Using with Claude Desktop

### Basic Commands

```
Claude, search documentation for React hooks
```

```
Claude, analyze this Python code and suggest improvements...
```

```
Claude, find best practices for Next.js App Router
```

### Advanced Usage

```
Claude, search for documentation about async/await in Python 3.9
```

```
Claude, analyze this code for security issues and suggest fixes...
```

For more examples, see the [Usage Guide](docs/USAGE.md)

## Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

## Testing

Run the test suite:

```bash
npm test
```

Run specific tests:

```bash
npm test -- tests/integration/BraveSearchIntegration.test.ts
```

## License

This project is licensed under the MIT License - see the LICENSE file for details