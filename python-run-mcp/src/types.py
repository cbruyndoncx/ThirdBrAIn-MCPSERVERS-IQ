from pydantic import BaseModel, ConfigDict
from mcp.types import RequestParams, Result

class RunPythonRequestParams(RequestParams):
    """Parameters for running Python code."""
    
    code: str
    """The Python code to execute."""
    
    timeout: int | None = 30
    """Optional timeout in seconds. Defaults to 30."""
    
    model_config = ConfigDict(extra="allow")

class RunPythonResponse(Result):
    """Response from running Python code."""
    
    status: str
    """Status of the execution (success/error)."""
    
    result: dict
    """Dictionary containing output and error information."""
    
    model_config = ConfigDict(extra="allow")
