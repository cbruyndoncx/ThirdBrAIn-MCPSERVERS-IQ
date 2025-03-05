# MCP Inspector Guide

This guide covers how to use the Model Context Protocol inspector to test and validate the MCP server implementation.

## Quick Start

1. Start the server:
```bash
python src/server.py
```

2. Run the inspector:
```bash
npx @modelcontextprotocol/inspector
```

3. Use the default configuration:
- Server: http://localhost:8080
- Auth: None required

## Test Scripts

The `tests/` directory contains example test cases:
- `basic_test.json`: Basic Python execution tests
- `error_test.json`: Error handling scenarios

## Running Tests

Use the provided test scripts:
```bash
npx @modelcontextprotocol/inspector --config tests/basic_test.json
```

See `tests/README.md` for detailed test scenarios.