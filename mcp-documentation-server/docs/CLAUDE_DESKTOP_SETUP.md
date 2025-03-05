# Setting Up MCP Documentation Server with Claude Desktop

## Installation

1. First, install the MCP Documentation Server:
```bash
npm install -g mcp-documentation-server
```

2. Create a Claude Desktop configuration file:
   - Windows: `%APPDATA%\Claude\config.json`
   - macOS: `~/Library/Application Support/Claude/config.json`
   - Linux: `~/.config/Claude/config.json`

3. Add the following configuration:
```json
{
  "mcpServers": {
    "documentation": {
      "command": "npx",
      "args": ["-y", "mcp-documentation-server"],
      "env": {
        "BRAVE_API_KEY": "<YOUR_BRAVE_API_KEY>",
        "PORT": "3000"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_GITHUB_TOKEN>"
      }
    }
  }
}
```

## Configuration Options

### Documentation Server
```json
{
  "command": "npx",
  "args": ["-y", "mcp-documentation-server"],
  "env": {
    "BRAVE_API_KEY": "required_for_documentation_search",
    "PORT": "optional_port_number",
    "UPDATE_INTERVAL": "optional_update_interval_in_ms",
    "CACHE_DURATION": "optional_cache_duration_in_ms"
  }
}
```

### Environment Variables
- `BRAVE_API_KEY`: Your Brave Search API key
- `PORT`: Server port (default: 3000)
- `UPDATE_INTERVAL`: Documentation update interval (default: 1 hour)
- `CACHE_DURATION`: Cache duration (default: 24 hours)

## Integration with Other MCP Servers

The documentation server can work alongside other MCP servers:

### File System Access
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/docs"]
  }
}
```

### GitHub Integration
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token"
    }
  }
}
```

### Memory Server
```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"]
  }
}
```

## Verifying the Setup

1. Start Claude Desktop
2. Check server status:
```
Claude, check if the documentation server is running.
```

3. Test documentation search:
```
Claude, search for React hooks documentation.
```

## Troubleshooting

### Common Issues

1. **Server Not Starting**
   - Check if the `npx` command is available
   - Verify the configuration file location
   - Check environment variables

2. **Permission Issues**
   - Ensure proper file permissions for the configuration file
   - Verify access to the specified directories

3. **API Key Issues**
   - Verify Brave API key is correct
   - Check GitHub token permissions if using GitHub integration

### Debug Mode

Add debug logging by setting the environment variable:
```json
{
  "env": {
    "DEBUG": "mcp:*"
  }
}
```

## Security Considerations

1. **API Keys**:
   - Store API keys securely
   - Use environment variables
   - Never commit tokens to version control

2. **File System Access**:
   - Limit access to necessary directories
   - Use absolute paths
   - Avoid sensitive directories

3. **Network Access**:
   - Configure firewalls appropriately
   - Use HTTPS for external connections
   - Monitor server logs

## Updates and Maintenance

1. Update the package:
```bash
npm update -g mcp-documentation-server
```

2. Check version:
```bash
npx mcp-documentation-server --version
```

3. Clear cache:
```bash
npx mcp-documentation-server clear-cache
```