# MCP Gradio Client Configuration Guide

This guide explains how to set up the `config.json` file for the MCP Gradio client. The configuration file specifies the MCP servers that the client will connect to and how to interact with them.

There's an example `config.json` file in the project root directory. You can use this as a template for your own configuration.
- [example_config.json](..%2Fexample_config.json)

## Configuration File Structure

The `config.json` file should contain a single top-level object with a `mcpServers` property. Each entry in `mcpServers` represents a different MCP server configuration.

Basic structure:
```json
{
  "mcpServers": {
    "server-name": {
      "type": "stdio|sse",
      // other configuration options
    }
  }
}
```

## Required Fields

Every server configuration must include:

- `type`: Either "stdio" or "sse"
  - `stdio`: For command-line based servers
  - `sse`: For HTTP Server-Sent Events based servers

## Server Type-Specific Configuration

### STDIO Servers

For `stdio` type servers, you need:
- `command`: The command to execute
- `args` (optional): Array of command-line arguments
- `env` (optional): Environment variables

### SSE Servers

For `sse` type servers, you need:
- `url`: The SSE endpoint URL
- `headers` (optional): HTTP headers for the connection

## Important Considerations

1. **Tool Name Conflicts**
   - If multiple servers provide tools with the same name, only the last initialized tool will be available
   - Ensure unique tool names across your servers to avoid conflicts

2. **Platform-Specific Commands**
   - Windows and Unix require different command configurations
   - Example: Use `npx.cmd` on Windows but `npx` on Unix
   - Always use appropriate path separators for your OS

3. **Python Module Commands**
   - When using `python -m` commands, ensure the module is installed first
   - Example: `pip install mcp-server-fetch` before using `python -m mcp_server_fetch`

4. **FastMCP Integration**
   - Direct FastMCP commands often need to be wrapped in batch/shell scripts
   - Create separate .bat (Windows) or .sh (Unix) files for complex commands

## Example Configurations

### 1. Simple Python Module Server
- Ensure you have the `mcp_server_fetch` module installed first.  Typically instructions are found with the source repo
and mimic `pip install mcp_server_fetch` or `pip install -e .` in the source directory
```json
{
  "mcpServers": {
    "fetch": {
      "type": "stdio",
      "command": "python",
      "args": ["-m", "mcp_server_fetch"]
    }
  }
}
```

### 2. UVX-based Server
Most `uvx` based servers are designed to be run without a specific installation. We can use a relatively straightforward configuration.
```json
{
  "mcpServers": {
    "fetch2": {
      "type": "stdio",
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

### 3. Batch File Server (Windows) - FastMCP
Sometimes we have servers that have lots of requirements and configurations to get up and running the way we want. This often conflicts with `gradio`.
In these cases, we can create a batch file to handle the server setup and execution and then just call the .bat file.
The ending command must be a valid OS command.  In this case, we are running a batch file.
```json
{
  "mcpServers": {
    "stdio_weather": {
      "type": "stdio",
      "command": "C:\\path\\to\\run-weather.bat"
    }
  }
}
```

Notes on FastMCP
- [FastMCP](https://github.com/jlowin/fastmcp) - is a utility to rapidly create STDIO Python servers.  However, it has to run with the Fastmcp library.
- FastMCP has an install command that is focused on installing the package and adding it to `claude_desktop_config.json` file.  In essence it says to run the server with `uv run --with fastmcp fastmcp run server.py`
- Because of how fastmcp works with uv, it tries to build a local version in this `gradio` project folder, which won't work.
- To get around this, we have to do some magic with a `.bat` file to get it to run properly.
- The key is change the directory prior to running the server. We can manage this by creating a `.bat` file like this
- We use the `/d` command in case the server is on a different drive from our project. It's just extra insurance.
```batch
@echo off
cd /d C:\path\to\server\directory
uv run --with fastmcp fastmcp run server.py
```
- Then we simply call the `.bat` file in the `config.json` file instead.


### 4. SSE Server
SSE Servers are typically HTTP servers that send events to clients. In this case the server must be up and running before starting the `gradio` app. Headers are not currently supported.
We just need the URL to connect to the server.
```json
{
  "mcpServers": {
    "sse_weather": {
      "type": "sse",
      "url": "http://127.0.0.1:3001/sse",
      "headers": {}
    }
  }
}
```

### 5. NPX Server with Environment Variables
We can also use npx server.  Here's an example fo npx with environment variables.
```json
{
  "mcpServers": {
    "brave-search": {
      "type": "stdio",
      "command": "npx.cmd",  // Use "npx" for Unix
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```


## Troubleshooting

1. **Command Not Found Error**
   - Ensure the command is in your system's PATH
   - For Python modules, verify they're installed: `pip list`
   - For NPX commands, check npm installation: `npm list -g`

2. **Path Issues**
   - Use absolute paths when possible
   - Use correct path separators (`\` for Windows, `/` for Unix)
   - Verify file permissions

3. **Tool Conflicts**
   - Check for duplicate tool names across servers
   - Last initialized server's tool takes precedence

4. **Environment Variables**
   - Ensure required environment variables are set
   - Check for proper API keys and credentials
   - Use appropriate variable format for your OS

5. **Look at your Logs**
   - If you're having trouble, look at the console output.  Buried in there is often the key to what's going wrong.
