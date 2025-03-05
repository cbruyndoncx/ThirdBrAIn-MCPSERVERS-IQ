# MCP Server Test Suite

This directory contains test configurations and examples for the MCP inspector.

## Available Tests

### Basic Tests (`basic_test.json`)
- Simple Python code execution
- Basic arithmetic operations
- String manipulation

### Error Tests (`error_test.json`)
- Invalid syntax handling
- Runtime error scenarios
- Timeout cases

## Running Tests

1. Start the server
2. Run specific test suite:
```bash
npx @modelcontextprotocol/inspector --config tests/basic_test.json
```

## Adding New Tests

Create new test files following the format in `test_template.json`