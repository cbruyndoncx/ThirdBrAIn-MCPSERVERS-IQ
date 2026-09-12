import subprocess
import time
from typing import Optional, Dict, List
from google.cloud import run_v2
from google.iam.v1 import iam_policy_pb2
from google.cloud import run_v2
from google.iam.v1 import iam_policy_pb2, policy_pb2
import dotenv
dotenv.load_dotenv()


def allow_unauthenticated_access(project_id, location, service_name):
    """
    Sets IAM policy to allow unauthenticated access to a Cloud Run service.
    
    Args:
        project_id (str): Google Cloud project ID
        location (str): Region where the service is deployed (e.g., 'us-central1')
        service_name (str): Name of the Cloud Run service
    """
    # Initialize the Cloud Run services client
    client = run_v2.ServicesClient()
    
    # Construct the full resource name for the service
    resource = client.service_path(project_id, location, service_name)
    
    # Create a policy binding that grants allUsers the run.invoker role
    binding = policy_pb2.Binding()
    binding.role = "roles/run.invoker"
    binding.members.append("allUsers")
    
    # Create the policy with the binding
    policy = policy_pb2.Policy()
    policy.bindings.append(binding)
    
    # Create the SetIamPolicyRequest
    request = iam_policy_pb2.SetIamPolicyRequest(
        resource=resource,
        policy=policy
    )
    
    # Set the IAM policy
    response = client.set_iam_policy(request=request)
    
    print(f"Successfully set IAM policy for {service_name} to allow public access.")
    return response

def deploy_cloud_run_service(
    project_id: str,
    service_name: str,
    command: str,
    port: int = 8000,
    region: str = "us-central1",
    env_vars: Optional[Dict[str, str]] = None
) -> str:
    """
    Deploy or update a Cloud Run service running the specified command
    
    Args:
        project_id: GCP project ID
        service_name: Name for the Cloud Run service
        command: Command to run in the container
        port: Port to expose
        region: GCP region to deploy to
        env_vars: Optional environment variables
        
    Returns:
        URL of the deployed service
    """
    
    # Create Cloud Run client
    client = run_v2.ServicesClient()
    
    # Format the parent resource and service name
    parent = f"projects/{project_id}/locations/{region}"
    service_path = f"{parent}/services/{service_name}"
    
    # Build the container command
    container_command = [
        "supergateway",
        "--stdio",
        command,
        "--port",
        str(port)
    ]
    
    # Build the service config
    service = {
        "template": {
            "containers": [{
                "image": "us-central1-docker.pkg.dev/ai-drive-hack/mcp-servers/supergateway:latest",
                "command": container_command,
                "ports": [{"container_port": port}]
            }]
        },
        "ingress": "INGRESS_TRAFFIC_ALL",
    }
    
    # Add environment variables if specified
    if env_vars:
        service["template"]["containers"][0]["env"] = [
            {"name": k, "value": v} for k,v in env_vars.items()
        ]

    try:
        # Try to get existing service
        existing_service = client.get_service(name=service_path)
        
        # Update existing service
        operation = client.update_service(
            service={"name": service_path, **service}
        )
    except Exception:
        # Service doesn't exist, create new one
        operation = client.create_service(
            parent=parent,
            service_id=service_name,
            service=service
        )
    
    # Wait for deployment to complete
    response = operation.result(timeout=300)
    
    allow_unauthenticated_access(project_id, region, service_name)
    # Return the service URL
    return response.uri

if __name__ == "__main__":
    # Example usage
    url = deploy_cloud_run_service(
        project_id="ai-drive-hack",
        service_name="mcp-filesystem",
        command="npx -y @modelcontextprotocol/server-filesystem /root",
        port=8000
    )
    print(f"Service deployed at: {url}")
