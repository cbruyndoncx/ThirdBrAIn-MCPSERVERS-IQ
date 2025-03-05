#!/bin/bash

# Start the MCP server in the background
python src/server.py &
server_pid=$!

# Wait for server to start
sleep 2

# Run basic tests
echo "Running basic tests..."
npx @modelcontextprotocol/inspector --config tests/basic_test.json

# Run error tests
echo "Running error tests..."
npx @modelcontextprotocol/inspector --config tests/error_test.json

# Cleanup
kill $server_pid
