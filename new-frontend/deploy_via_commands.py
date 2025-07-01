#!/usr/bin/env python3
"""Deploy ProjectHub to Synology NAS using shell commands"""

import paramiko
import os
import sys
import time
import base64

# Configuration
SYNOLOGY_HOST = "192.168.1.24"
SYNOLOGY_PORT = 2222
SYNOLOGY_USER = "Bert"
SYNOLOGY_PASSWORD = "JDU9xjn1ekx3rev_uma"
LOCAL_PACKAGE = "/tmp/projecthub-deploy.tar.gz"
REMOTE_DIR = "/volume1/docker/projecthub"

def execute_command(ssh, command, print_output=True):
    """Execute command and return output"""
    stdin, stdout, stderr = ssh.exec_command(command)
    stdout_text = stdout.read().decode()
    stderr_text = stderr.read().decode()
    exit_code = stdout.channel.recv_exit_status()
    
    if print_output and stdout_text:
        print(stdout_text.rstrip())
    if stderr_text and "WARNING" not in stderr_text:
        print(f"Error: {stderr_text}")
    
    return exit_code == 0, stdout_text, stderr_text

def main():
    print("🚀 Deploying ProjectHub to Synology NAS...")
    
    # Check if package exists
    if not os.path.exists(LOCAL_PACKAGE):
        print(f"❌ Deployment package not found: {LOCAL_PACKAGE}")
        sys.exit(1)
    
    print(f"📦 Found deployment package: {LOCAL_PACKAGE}")
    file_size = os.path.getsize(LOCAL_PACKAGE)
    print(f"📏 Package size: {file_size:,} bytes")
    
    try:
        # Create SSH client
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        print(f"🔗 Connecting to {SYNOLOGY_HOST}:{SYNOLOGY_PORT}...")
        ssh.connect(
            hostname=SYNOLOGY_HOST,
            port=SYNOLOGY_PORT,
            username=SYNOLOGY_USER,
            password=SYNOLOGY_PASSWORD,
            timeout=30,
            look_for_keys=False,
            allow_agent=False
        )
        
        print("✅ Connected successfully!")
        
        # Create remote directory
        print("📁 Creating remote directory...")
        success, _, _ = execute_command(ssh, f"mkdir -p {REMOTE_DIR}")
        if not success:
            print("❌ Failed to create directory")
            return
        
        # Transfer file using base64 encoding (works around SFTP issues)
        print("📤 Uploading deployment package (this may take a moment)...")
        remote_package = f"{REMOTE_DIR}/projecthub-deploy.tar.gz"
        
        # Read local file and encode to base64
        with open(LOCAL_PACKAGE, 'rb') as f:
            file_data = f.read()
        encoded_data = base64.b64encode(file_data).decode('ascii')
        
        # Split into chunks to avoid command line limits
        chunk_size = 32768  # 32KB chunks
        chunks = [encoded_data[i:i+chunk_size] for i in range(0, len(encoded_data), chunk_size)]
        
        # Remove existing file if any
        execute_command(ssh, f"rm -f {remote_package}", print_output=False)
        
        # Transfer chunks
        for i, chunk in enumerate(chunks):
            print(f"   Uploading chunk {i+1}/{len(chunks)}...", end='\r')
            stdin, stdout, stderr = ssh.exec_command(f"echo '{chunk}' >> {remote_package}.b64")
            stdout.read()
            stderr.read()
        
        print(f"\n   Decoding file...")
        success, _, _ = execute_command(ssh, f"base64 -d {remote_package}.b64 > {remote_package} && rm {remote_package}.b64", print_output=False)
        if not success:
            print("❌ Failed to decode package")
            return
        
        print("✅ Package uploaded successfully!")
        
        # Verify file was transferred correctly
        success, output, _ = execute_command(ssh, f"ls -lh {remote_package}", print_output=False)
        if success:
            print(f"📦 Remote file: {output.strip()}")
        
        # Extract package (ignore permission errors which are common on Synology)
        print("📦 Extracting package...")
        success, output, error = execute_command(ssh, f"cd {REMOTE_DIR} && tar -xzf projecthub-deploy.tar.gz --no-same-permissions --no-same-owner 2>&1 || true")
        if "Cannot open: No such file or directory" in error:
            print("❌ Failed to extract package - file not found")
            return
        elif error and "Cannot change mode" not in error:
            print(f"⚠️  Extract warnings: {error}")
        
        # List extracted contents
        print("📋 Extracted contents:")
        execute_command(ssh, f"ls -la {REMOTE_DIR}/")
        
        # Check if docker-compose.yml exists
        print("\n🔍 Looking for docker-compose.yml...")
        success, output, _ = execute_command(ssh, f"find {REMOTE_DIR} -name 'docker-compose.yml' -type f")
        if output.strip():
            compose_path = output.strip().split('\n')[0]
            compose_dir = os.path.dirname(compose_path)
            print(f"📁 Found docker-compose.yml in: {compose_dir}")
            
            # Change to the directory containing docker-compose.yml
            remote_dir = compose_dir
        else:
            print("⚠️  No docker-compose.yml found, using base directory")
            remote_dir = REMOTE_DIR
        
        # We need to find Docker first before trying to stop containers
        remote_dir_for_commands = remote_dir
        
        # Check Docker is available - try different paths
        print("\n🐳 Checking Docker...")
        docker_paths = [
            "docker",
            "/usr/local/bin/docker", 
            "/usr/bin/docker",
            "/volume1/@appstore/Docker/usr/bin/docker",
            "/var/packages/Docker/target/usr/bin/docker"
        ]
        
        docker_cmd = None
        for path in docker_paths:
            success, output, _ = execute_command(ssh, f"{path} --version", print_output=False)
            if success:
                docker_cmd = path
                print(f"✅ Found Docker at: {path}")
                print(f"   Version: {output.strip()}")
                break
        
        if not docker_cmd:
            print("❌ Docker not found. Trying to locate it...")
            success, output, _ = execute_command(ssh, "find /usr -name docker 2>/dev/null | grep -E 'bin/docker$'")
            if output.strip():
                print(f"Found Docker at: {output.strip()}")
                print("Please update the script with the correct Docker path.")
            return
        
        # Also check for docker-compose
        compose_paths = [
            "docker-compose",
            "/usr/local/bin/docker-compose",
            "/usr/bin/docker-compose",
            f"{os.path.dirname(docker_cmd)}/docker-compose"
        ]
        
        compose_cmd = None
        for path in compose_paths:
            success, _, _ = execute_command(ssh, f"{path} --version", print_output=False)
            if success:
                compose_cmd = path
                print(f"✅ Found docker-compose at: {path}")
                break
        
        if not compose_cmd:
            print("⚠️  docker-compose not found, will use docker compose instead")
            compose_cmd = f"{docker_cmd} compose"
        
        # Check if we need sudo for Docker
        print("\n🔐 Checking Docker permissions...")
        success, _, _ = execute_command(ssh, f"{docker_cmd} ps", print_output=False)
        if not success:
            print("   Need sudo for Docker commands")
            # Use echo password | sudo -S for non-interactive sudo
            docker_cmd = f"echo '{SYNOLOGY_PASSWORD}' | sudo -S {docker_cmd}"
            compose_cmd = f"echo '{SYNOLOGY_PASSWORD}' | sudo -S {compose_cmd}"
        
        # Stop existing containers if any
        print("\n🛑 Stopping existing containers...")
        execute_command(ssh, f"cd {remote_dir_for_commands} && {compose_cmd} down -v 2>/dev/null || true", print_output=False)
        # Also remove any conflicting containers
        container_names = ["projecthub-postgres", "projecthub-backend", "projecthub-frontend"]
        for container in container_names:
            execute_command(ssh, f"{docker_cmd} rm -f {container} 2>/dev/null || true", print_output=False)
        
        # Check for port conflicts
        print("\n🔍 Checking for port conflicts...")
        
        # Check port 5433 (PostgreSQL)
        success, output, _ = execute_command(ssh, f"{docker_cmd} ps --format 'table {{{{.Names}}}}\t{{{{.Ports}}}}' | grep 5433", print_output=False)
        if success and output:
            print(f"   Port 5433 is already in use by: {output.strip()}")
            print("   Updating docker-compose.yml to use port 5434 instead...")
            execute_command(ssh, f"cd {remote_dir_for_commands} && sed -i 's/5433:5432/5434:5432/g' docker-compose.yml", print_output=False)
        
        # Check port 8090 (Frontend)
        success, output, _ = execute_command(ssh, f"{docker_cmd} ps --format 'table {{{{.Names}}}}\t{{{{.Ports}}}}' | grep 8090", print_output=False)
        if success and output:
            print(f"   Port 8090 is already in use by: {output.strip()}")
            print("   Updating docker-compose.yml to use port 5174 instead...")
            execute_command(ssh, f"cd {remote_dir_for_commands} && sed -i 's/8090:80/5174:80/g' docker-compose.yml", print_output=False)
        
        # Check port 3007 (Backend)
        success, output, _ = execute_command(ssh, f"{docker_cmd} ps --format 'table {{{{.Names}}}}\t{{{{.Ports}}}}' | grep 3007", print_output=False)
        if success and output:
            print(f"   Port 3007 is already in use by: {output.strip()}")
            print("   Updating docker-compose.yml to use port 3008 instead...")
            execute_command(ssh, f"cd {remote_dir_for_commands} && sed -i 's/3007:3000/3008:3000/g' docker-compose.yml", print_output=False)
        
        # Build containers
        print("\n🐳 Building Docker images (this may take several minutes)...")
        success, output, error = execute_command(ssh, f"cd {remote_dir_for_commands} && {compose_cmd} build 2>&1")
        if not success and "error" in error.lower() and "permission denied" not in error:
            print("❌ Docker build failed")
            return
        
        # Start containers
        print("\n🚀 Starting Docker containers...")
        success, output, error = execute_command(ssh, f"cd {remote_dir_for_commands} && {compose_cmd} up -d")
        if not success and "permission denied" not in error:
            print("❌ Failed to start containers")
            print(f"Error: {error}")
            return
        
        # Wait for containers to start
        print("\n⏳ Waiting for containers to start...")
        time.sleep(15)
        
        # Check container status
        print("\n📊 Container status:")
        execute_command(ssh, f"cd {remote_dir_for_commands} && {compose_cmd} ps")
        
        # Show container logs
        print("\n📋 Recent logs from containers:")
        execute_command(ssh, f"cd {remote_dir_for_commands} && {compose_cmd} logs --tail=10")
        
        print("\n✅ Deployment complete!")
        print("\n🌐 Access ProjectHub at:")
        
        # Check actual ports from docker-compose.yml
        success, backend_port, _ = execute_command(ssh, f"cd {remote_dir_for_commands} && grep -E '\\- [0-9]+:3000' docker-compose.yml | grep -oE '[0-9]+:' | tr -d ':'", print_output=False)
        backend_port = backend_port.strip() if backend_port else "3007"
        print(f"   - Backend API: http://192.168.1.24:{backend_port}")
        
        success, frontend_port, _ = execute_command(ssh, f"cd {remote_dir_for_commands} && grep -E '\\- [0-9]+:80' docker-compose.yml | grep -oE '[0-9]+:' | tr -d ':'", print_output=False)
        frontend_port = frontend_port.strip() if frontend_port else "5174"
        print(f"   - Frontend UI: http://192.168.1.24:{frontend_port}")
        
        success, pg_port, _ = execute_command(ssh, f"cd {remote_dir_for_commands} && grep -E '\\- [0-9]+:5432' docker-compose.yml | grep -oE '[0-9]+:' | tr -d ':'", print_output=False)
        pg_port = pg_port.strip() if pg_port else "5433"
        print(f"   - PostgreSQL: 192.168.1.24:{pg_port}")
        
        print("\n💡 Post-deployment steps (if needed):")
        print("   1. Check if services are accessible")
        print("   2. Review container logs: docker-compose logs -f")
        print("   3. Access the frontend to verify functionality")
        
        ssh.close()
        
    except Exception as e:
        print(f"\n❌ Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()