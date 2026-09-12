import socket
from typing import Optional
from fastapi.responses import FileResponse
from mcp import ClientSession, StdioServerParameters, types
from mcp.client.stdio import stdio_client
from mcp.client.sse import sse_client
import json
import os
import uvicorn
import dotenv
import cloud_run

dotenv.load_dotenv()
db_file = "mcp_servers.json"
base_port = 9031

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()


import subprocess
from typing import List, Optional, Dict

def run_subprocess(
    command: str,
    args: Optional[List[str]] = None,
    env: Optional[Dict[str, str]] = None,
    cwd: Optional[str] = None
) -> subprocess.Popen:
    cmd = [command]
    if args:
        cmd.extend(args)      
    try:
        process = subprocess.Popen(
            cmd,
            env=env,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return process
    except Exception as e:
        # Re-raise with command info
        raise RuntimeError(f"Failed to start command '{' '.join(cmd)}': {str(e)}") from e


# Model for tool invocation request
class ToolInvocationRequest(BaseModel):
    server_name: str = Field(description="Name of the MCP server to invoke the tool on")
    tool_name: str = Field(description="Name of the tool to invoke")
    arguments: Optional[dict] = Field(default=None, description="Dictionary of arguments to pass to the tool")

class MCPServer(BaseModel):
    name: str
    description: str
    url: Optional[str] = None
    command: Optional[str] = None
    env: Optional[dict[str, str]] = None

def load_mcp_servers():
    if os.path.exists(db_file):
        with open(db_file, "r") as f:
            return json.load(f)
    return []


def check_port_availability(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(('localhost', port))
        sock.close()
        return True
    except OSError:
        return False

@app.get("/")
async def serve_index():
    """Serve the main index.html page"""
    return FileResponse("index.html")


def run_all_mcp_servers():
    mcp_servers = load_mcp_servers()
    for i, server in enumerate(mcp_servers):
        if not server["url"].startswith("http://localhost"):
            print(f"Server {server['name']} is not running at http://localhost so not starting it")
            continue
        if not check_port_availability(base_port + i):
            print(f"Port {base_port + i} is already in use. Assuming server is already running.")
            continue
        base_cmd = f"/Users/karthikramasamy/.nvm/versions/node/v22.13.1/bin/npx"
        args = f"-y supergateway --port {base_port + i} --stdio ".split()
        env_vars = server["env"]
        env_var_str = ""
        if env_vars:
            for key, value in env_vars.items():
                env_var_str += f" {key}={value} "
        args.append(f"{env_var_str} {server["command"]}")
        print(base_cmd, args)
        run_subprocess(base_cmd, args)
        


@app.post("/add-mcp-server")
async def add_mcp_server(request: MCPServer):
    print(json.dumps(request.model_dump(), indent=4))
    """Add a new MCP server to the list of available servers"""
    # Convert the request to a dictionary and save it to a JSON file
    mcp_servers = load_mcp_servers()
    server_data = request.model_dump()
    if server_data["url"] is None:
        server_data["url"] = f"http://localhost:{base_port + len(mcp_servers)}/sse"
    mcp_servers.append(server_data)
    try:
        with open(db_file, "w") as f:
            json.dump(mcp_servers, f, indent=4)
        run_all_mcp_servers()
        return {"message": f"Server configuration saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save server configuration: {str(e)}")

@app.get("/list-mcp-servers")
async def list_servers():
    """List available MCP servers and their configurations"""
    mcp_servers = load_mcp_servers()
    # Return only name and description for each server
    return [{"name": server["name"], "description": server["description"]} for server in mcp_servers]

@app.get("/list-mcp-servers-full")
async def list_servers_full():
    """List available MCP servers and their configurations"""
    mcp_servers = load_mcp_servers()
    # Return only name and description for each server
    return mcp_servers

class ListMCPToolsRequest(BaseModel):
    server_name: str = Field(description="Name of the MCP server to list tools for")

@app.post("/list-mcp-tools")
async def list_tools(request: ListMCPToolsRequest):
    print(json.dumps(request.model_dump(), indent=4))
    mcp_servers = load_mcp_servers()
    mcp_server = next((server for server in mcp_servers if server["name"] == request.server_name), None)
    if mcp_server is None:
        raise HTTPException(status_code=404, detail="Server not found, should be one of the following: " + ", ".join([server["name"] for server in mcp_servers]))

    async with sse_client(mcp_server["url"]) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools_response = await session.list_tools()
            
            for tool_res in tools_response:
                if tool_res[0] == "tools":
                    return {"mcp-tools": [tool.model_dump() for tool in tool_res[1]]}
            
            raise HTTPException(status_code=500, detail="Failed to get tools list")

@app.post("/invoke-mcp-tool")
async def invoke_tool(request: ToolInvocationRequest):
    print(json.dumps(request.model_dump(), indent=4))
    mcp_servers = load_mcp_servers()
    mcp_server = next((server for server in mcp_servers if server["name"] == request.server_name), None)
    if mcp_server is None:
        raise HTTPException(status_code=404, detail="Server not found, should be one of the following: " + ", ".join([server["name"] for server in mcp_servers]))

    tools_response = await list_tools(ListMCPToolsRequest(server_name=request.server_name))
    if request.tool_name not in [tool["name"] for tool in tools_response["mcp-tools"]]:
        raise HTTPException(status_code=404, detail="Tool not found, should be one of the following: " + ", ".join([tool["name"] for tool in tools_response["mcp-tools"]]))

    async with sse_client(mcp_server["url"]) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            try:
                result = await session.call_tool(request.tool_name, arguments=request.arguments)
                print(f"Tool {request.tool_name} returned:")
                print(json.dumps(result.model_dump(), indent=4))
                return result.model_dump()
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    run_all_mcp_servers()
    uvicorn.run(app, host="0.0.0.0", port=8080)