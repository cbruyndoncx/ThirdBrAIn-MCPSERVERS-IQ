# MCP FastAPI Server

A FastAPI-based async API server that communicates with Model Context Protocol (MCP) servers.

## Features

- List available MCP servers
- List tools available from MCP servers
- Invoke tools on MCP servers

## API Endpoints

- `POST /api/list-mcp-servers`: List all available MCP servers
- `POST /api/list-tools`: List all tools available from an MCP server
- `POST /api/invoke-tool`: Invoke a tool on an MCP server

## Prerequisites

- Python 3.8 or higher
- An accessible MCP server (local or remote)

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd mcp-fastapi-server
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # For Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file to configure your MCP server URL and other settings.

## Running the Server

Start the server with:

```bash
uvicorn app.main:app --reload
```

This will start the server on `http://localhost:8000`.

## API Usage Examples

### List MCP Servers

```bash
curl -X POST http://localhost:8000/api/list-mcp-servers -H "Content-Type: application/json" -d '{}'
```

### List Tools from an MCP Server

```bash
curl -X POST http://localhost:8000/api/list-tools -H "Content-Type: application/json" -d '{"server_url": "http://localhost:5000"}'
```

### Invoke a Tool

```bash
curl -X POST http://localhost:8000/api/invoke-tool -H "Content-Type: application/json" -d '{
  "server_url": "http://localhost:5000",
  "tool_name": "example_tool",
  "params": {
    "parameter1": "value1",
    "parameter2": "value2"
  }
}'
```

## Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

MIT # chat-mcp
