# ProjectHub-MCP Installer Script for Windows
# This script installs ProjectHub-MCP with all required components

# Requires PowerShell to be run as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges. Please run PowerShell as Administrator." -ForegroundColor Red
    exit 1
}

# Configuration
$POSTGRES_PASSWORD = "projecthub_secure_2024"
$POSTGRES_USER = "projecthub"
$POSTGRES_DB = "projecthub_mcp"
$JWT_SECRET = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# Colors for output
function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

function Write-Header {
    Write-Host "=================================================" -ForegroundColor Blue
    Write-Host "       ProjectHub-MCP Installer" -ForegroundColor Blue
    Write-Host "=================================================" -ForegroundColor Blue
    Write-Host ""
}

# Check if Docker is installed
function Check-Docker {
    try {
        $dockerVersion = docker --version
        Write-Success "Docker is installed: $dockerVersion"
        return $true
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker Desktop for Windows."
        Write-Host "Visit: https://docs.docker.com/desktop/windows/install/" -ForegroundColor Cyan
        return $false
    }
}

# Check if Docker Compose is installed
function Check-DockerCompose {
    try {
        # Try docker-compose command
        $null = docker-compose --version 2>$null
        Write-Success "Docker Compose is installed"
        return $true
    }
    catch {
        # Try docker compose (plugin version)
        try {
            $null = docker compose version 2>$null
            Write-Success "Docker Compose (plugin) is installed"
            return $true
        }
        catch {
            Write-Error "Docker Compose is not installed."
            Write-Host "Docker Compose should be included with Docker Desktop." -ForegroundColor Cyan
            return $false
        }
    }
}

# Check if PostgreSQL is already running
function Check-Postgres {
    $existingContainer = docker ps --format "table {{.Names}}" | Select-String "projecthub-postgres"
    if ($existingContainer) {
        Write-Info "PostgreSQL container already exists"
        return @{UseExternal = $false}
    }
    
    # Check if port 5432 is in use
    $tcpConnection = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet
    if ($tcpConnection) {
        Write-Info "Port 5432 is already in use. Using existing PostgreSQL."
        $pgHost = Read-Host "Enter PostgreSQL host [localhost]"
        if ([string]::IsNullOrWhiteSpace($pgHost)) { $pgHost = "localhost" }
        
        $pgPort = Read-Host "Enter PostgreSQL port [5432]"
        if ([string]::IsNullOrWhiteSpace($pgPort)) { $pgPort = "5432" }
        
        $pgUser = Read-Host "Enter PostgreSQL user"
        $pgPassword = Read-Host "Enter PostgreSQL password" -AsSecureString
        $pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))
        
        return @{
            UseExternal = $true
            Host = $pgHost
            Port = $pgPort
            User = $pgUser
            Password = $pgPasswordPlain
        }
    }
    
    return @{UseExternal = $false}
}

# Create Docker network if it doesn't exist
function Create-Network {
    $networks = docker network ls --format "{{.Name}}"
    if ($networks -notcontains "projecthub-network") {
        docker network create projecthub-network
        Write-Success "Created Docker network: projecthub-network"
    }
    else {
        Write-Info "Docker network already exists: projecthub-network"
    }
}

# Install PostgreSQL if needed
function Install-Postgres {
    param($PostgresConfig)
    
    if (-not $PostgresConfig.UseExternal) {
        Write-Info "Installing PostgreSQL..."
        
        $postgresCmd = @"
docker run -d `
    --name projecthub-postgres `
    --network projecthub-network `
    -e POSTGRES_USER=$POSTGRES_USER `
    -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD `
    -e POSTGRES_DB=$POSTGRES_DB `
    -p 5432:5432 `
    -v projecthub_postgres_data:/var/lib/postgresql/data `
    --restart unless-stopped `
    postgres:16-alpine
"@
        
        Invoke-Expression $postgresCmd
        
        Write-Success "PostgreSQL installed"
        
        # Wait for PostgreSQL to be ready
        Write-Info "Waiting for PostgreSQL to be ready..."
        Start-Sleep -Seconds 10
        
        # Initialize database schema
        Write-Info "Initializing database schema..."
        $schemaSQL = @"
CREATE SCHEMA IF NOT EXISTS project_management;

CREATE TABLE IF NOT EXISTS project_management.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS project_management.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project_management.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    assignee VARCHAR(100),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON project_management.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_management.tasks(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON project_management.projects(status);
"@
        
        # Save SQL to temp file
        $tempFile = [System.IO.Path]::GetTempFileName()
        Set-Content -Path $tempFile -Value $schemaSQL
        
        # Execute SQL
        docker cp $tempFile projecthub-postgres:/tmp/schema.sql
        docker exec projecthub-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -f /tmp/schema.sql
        
        Remove-Item $tempFile
        
        Write-Success "Database schema initialized"
    }
}

# Install Backend
function Install-Backend {
    param($PostgresConfig)
    
    Write-Info "Installing ProjectHub-MCP Backend..."
    
    # Stop and remove existing backend if it exists
    docker stop projecthub-mcp-backend 2>$null
    docker rm projecthub-mcp-backend 2>$null
    
    # Pull latest backend image
    docker pull ghcr.io/anubissbe/projecthub-mcp-backend:latest
    
    # Determine database URL
    if ($PostgresConfig.UseExternal) {
        $databaseUrl = "postgresql://$($PostgresConfig.User):$($PostgresConfig.Password)@$($PostgresConfig.Host):$($PostgresConfig.Port)/$POSTGRES_DB"
    }
    else {
        $databaseUrl = "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@projecthub-postgres:5432/$POSTGRES_DB"
    }
    
    # Get host IP
    $hostIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
    
    # Run backend
    $backendCmd = @"
docker run -d `
    --name projecthub-mcp-backend `
    --network projecthub-network `
    -p 3001:3001 `
    -e NODE_ENV=production `
    -e DATABASE_URL="$databaseUrl" `
    -e CORS_ORIGIN="http://localhost:5173,http://${hostIP}:5173" `
    -e JWT_SECRET="$JWT_SECRET" `
    -e LOG_LEVEL=info `
    --restart unless-stopped `
    ghcr.io/anubissbe/projecthub-mcp-backend:latest
"@
    
    Invoke-Expression $backendCmd
    
    Write-Success "Backend installed and running on port 3001"
}

# Install Frontend
function Install-Frontend {
    Write-Info "Installing ProjectHub-MCP Frontend..."
    
    # Stop and remove existing frontend if it exists
    docker stop projecthub-mcp-frontend 2>$null
    docker rm projecthub-mcp-frontend 2>$null
    
    # Pull latest frontend image
    docker pull ghcr.io/anubissbe/projecthub-mcp-frontend:branded
    
    # Run frontend
    $frontendCmd = @"
docker run -d `
    --name projecthub-mcp-frontend `
    --network projecthub-network `
    -p 5173:5173 `
    -e VITE_API_URL="http://localhost:3001/api" `
    -e VITE_WS_URL="http://localhost:3001" `
    --restart unless-stopped `
    ghcr.io/anubissbe/projecthub-mcp-frontend:branded
"@
    
    Invoke-Expression $frontendCmd
    
    Write-Success "Frontend installed and running on port 5173"
}

# Verify installation
function Verify-Installation {
    Write-Info "Verifying installation..."
    Start-Sleep -Seconds 5
    
    # Check if containers are running
    $backendRunning = docker ps | Select-String "projecthub-mcp-backend"
    if ($backendRunning) {
        Write-Success "Backend is running"
    }
    else {
        Write-Error "Backend is not running"
        docker logs projecthub-mcp-backend --tail 20
    }
    
    $frontendRunning = docker ps | Select-String "projecthub-mcp-frontend"
    if ($frontendRunning) {
        Write-Success "Frontend is running"
    }
    else {
        Write-Error "Frontend is not running"
        docker logs projecthub-mcp-frontend --tail 20
    }
    
    # Test backend health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend API is healthy"
        }
    }
    catch {
        Write-Error "Backend API is not responding"
    }
}

# Main installation flow
function Main {
    Write-Header
    
    Write-Info "Checking prerequisites..."
    
    # Check Docker
    if (-not (Check-Docker)) {
        exit 1
    }
    
    # Check Docker Compose
    if (-not (Check-DockerCompose)) {
        exit 1
    }
    
    Write-Info "Setting up ProjectHub-MCP..."
    
    # Check PostgreSQL
    $postgresConfig = Check-Postgres
    
    # Create network
    Create-Network
    
    # Install components
    Install-Postgres -PostgresConfig $postgresConfig
    Install-Backend -PostgresConfig $postgresConfig
    Install-Frontend
    
    # Verify installation
    Verify-Installation
    
    # Get host IP for display
    $hostIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
    
    Write-Host ""
    Write-Header
    Write-Success "ProjectHub-MCP installation completed!"
    Write-Host ""
    Write-Host "Access your ProjectHub-MCP instance at:" -ForegroundColor Green
    Write-Host "  • Local: http://localhost:5173" -ForegroundColor Green
    Write-Host "  • Network: http://${hostIP}:5173" -ForegroundColor Green
    Write-Host ""
    Write-Host "Default credentials have been set up."
    Write-Host "Database: $POSTGRES_DB"
    Write-Host ""
    Write-Host "To stop ProjectHub-MCP:" -ForegroundColor Cyan
    Write-Host "  docker stop projecthub-mcp-frontend projecthub-mcp-backend projecthub-postgres"
    Write-Host ""
    Write-Host "To start ProjectHub-MCP:" -ForegroundColor Cyan
    Write-Host "  docker start projecthub-postgres projecthub-mcp-backend projecthub-mcp-frontend"
    Write-Host ""
    Write-Host "To view logs:" -ForegroundColor Cyan
    Write-Host "  docker logs -f projecthub-mcp-backend"
    Write-Host "  docker logs -f projecthub-mcp-frontend"
    Write-Host ""
    Write-Info "Enjoy using ProjectHub-MCP! 🚀"
}

# Run main function
Main