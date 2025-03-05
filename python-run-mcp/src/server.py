import asyncio
import tempfile
import os
import shutil
import uuid
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types


# Create the server instance
server = Server("mock-python-runner")

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    # Provide a single tool: "run_python"
    return [
        types.Tool(
            name="run_python",
            description="Execute a Python command (mock implementation).",
            inputSchema={
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Python code to execute."
                    }
                },
                "required": ["code"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    """
    Execute Python code in a Docker container with specified requirements.
    This now:
    - Creates a temporary directory
    - Writes a Dockerfile and the code to a file
    - Builds a Docker image
    - Runs the container and captures output
    - Returns the output of the code execution
    """
    if name == "run_python":
        code = arguments.get("code", "")
        requirements = arguments.get("requirements", [])

        # Validate arguments
        if not isinstance(code, str) or not code.strip():
            return [types.TextContent(type="text", text="Error: 'code' must be a non-empty string.")]
        
        if not isinstance(requirements, list) or any(not isinstance(r, str) for r in requirements):
            return [types.TextContent(type="text", text="Error: 'requirements' must be a list of strings.")]

        # Create a temporary directory to store Dockerfile and code
        temp_dir = tempfile.mkdtemp(prefix="mcp-python-run-")
        try:
            dockerfile_path = os.path.join(temp_dir, "Dockerfile")
            code_path = os.path.join(temp_dir, "code.py")

            # Write code to code.py
            with open(code_path, "w", encoding="utf-8") as f:
                f.write(code)

            # Create Dockerfile
            # Use python:3.9-slim as a base image
            # Install requirements, copy code, and run it
            dockerfile_contents = [
                "FROM python:3.9-slim",
                "WORKDIR /app",
            ]
            if requirements:
                # Combine all requirements into a single pip install command
                dockerfile_contents.append(f"RUN pip install --no-cache-dir {' '.join(requirements)}")
            dockerfile_contents.append("COPY code.py .")
            dockerfile_contents.append('CMD ["python", "code.py"]')

            with open(dockerfile_path, "w", encoding="utf-8") as f:
                f.write("\n".join(dockerfile_contents))

            # Build docker image
            image_tag = f"mcp-run-python-{uuid.uuid4().hex}"
            build_cmd = ["docker", "build", "-t", image_tag, temp_dir]

            build_proc = await asyncio.create_subprocess_exec(
                *build_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            build_stdout, build_stderr = await build_proc.communicate()

            if build_proc.returncode != 0:
                error_msg = f"Failed to build docker image.\nSTDOUT:\n{build_stdout.decode()}\nSTDERR:\n{build_stderr.decode()}"
                return [types.TextContent(type="text", text=error_msg)]

            # Run container and capture output
            run_cmd = ["docker", "run", "--rm", image_tag]
            run_proc = await asyncio.create_subprocess_exec(
                *run_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            run_stdout, run_stderr = await run_proc.communicate()

            # Optionally remove the image after run (to avoid clutter)
            # Not mandatory, but good practice:
            cleanup_cmd = ["docker", "rmi", "-f", image_tag]
            cleanup_proc = await asyncio.create_subprocess_exec(*cleanup_cmd, stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
            await cleanup_proc.communicate()

            if run_proc.returncode != 0:
                # The python code returned a non-zero exit code
                # We'll still return stdout and stderr for debugging
                output = f"Python code exited with error.\nSTDOUT:\n{run_stdout.decode()}\nSTDERR:\n{run_stderr.decode()}"
            else:
                # Successful execution
                output = run_stdout.decode()

            return [
                types.TextContent(
                    type="text",
                    text=(
                        "Docker build and run complete.\n"
                        f"Requirements installed: {', '.join(requirements) if requirements else 'None'}\n"
                        f"Executed code:\n{code}\n\n"
                        f"Output:\n{output}"
                    )
                )
            ]
        finally:
            # Clean up temporary directory
            shutil.rmtree(temp_dir, ignore_errors=True)

    else:
        return [types.TextContent(type="text", text=f"Unknown tool: {name}")]

async def main():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        # Initialize and run server
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="mock-python-runner",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())
