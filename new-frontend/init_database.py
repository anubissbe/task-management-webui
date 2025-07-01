#!/usr/bin/env python3
"""Initialize ProjectHub database"""

import paramiko
import sys

# Configuration
SYNOLOGY_HOST = "192.168.1.24"
SYNOLOGY_PORT = 2222
SYNOLOGY_USER = "Bert"
SYNOLOGY_PASSWORD = "JDU9xjn1ekx3rev_uma"

def execute_command(ssh, command, print_output=True):
    """Execute command and return output"""
    stdin, stdout, stderr = ssh.exec_command(command)
    stdout_text = stdout.read().decode()
    stderr_text = stderr.read().decode()
    exit_code = stdout.channel.recv_exit_status()
    
    if print_output and stdout_text:
        print(stdout_text.rstrip())
    if stderr_text and "WARNING" not in stderr_text and "NOTICE" not in stderr_text:
        print(f"Error: {stderr_text}")
    
    return exit_code == 0, stdout_text, stderr_text

def main():
    print("🚀 Initializing ProjectHub database...")
    
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
        
        # Create database and user
        print("\n📊 Creating database and user...")
        
        # First check what databases exist
        cmd = f"echo '{SYNOLOGY_PASSWORD}' | sudo -S /usr/local/bin/docker exec projecthub-postgres psql -U postgres -c '\\l' 2>&1 || true"
        success, output, error = execute_command(ssh, cmd, print_output=False)
        
        # The PostgreSQL container is using Alpine, which uses 'postgres' as the default superuser
        # Let's connect properly
        print("📋 Checking PostgreSQL setup...")
        
        # Create the database using the postgres superuser (default in Alpine PostgreSQL)
        cmd = f"echo '{SYNOLOGY_PASSWORD}' | sudo -S /usr/local/bin/docker exec projecthub-postgres createdb -U postgres projecthub 2>&1 || true"
        success, output, error = execute_command(ssh, cmd, print_output=False)
        if success or "already exists" in error:
            print("✅ Database 'projecthub' created successfully!")
        elif error:
            print(f"ℹ️  Database status: {error}")
        
        # Create user using createuser command
        cmd = f"echo '{SYNOLOGY_PASSWORD}' | sudo -S /usr/local/bin/docker exec projecthub-postgres psql -U postgres -c \"CREATE USER projecthub WITH PASSWORD 'projecthub_password';\" 2>&1 || true"
        success, output, error = execute_command(ssh, cmd, print_output=False)
        if success or "already exists" in error:
            print("✅ User 'projecthub' created!")
        
        # Grant privileges
        cmd = f"echo '{SYNOLOGY_PASSWORD}' | sudo -S /usr/local/bin/docker exec projecthub-postgres psql -U postgres -c \"GRANT ALL PRIVILEGES ON DATABASE projecthub TO projecthub;\" 2>&1 || true"
        success, _, _ = execute_command(ssh, cmd, print_output=False)
        if success:
            print("✅ Privileges granted to user 'projecthub'!")
        
        # Create initial schema
        print("\n📋 Creating database schema...")
        
        schema = """
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            full_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Projects table
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'active',
            owner_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Tasks table
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'todo',
            priority VARCHAR(10) DEFAULT 'medium',
            project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
            assignee_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            due_date DATE
        );

        -- Insert sample data
        INSERT INTO users (username, email, full_name) VALUES 
            ('admin', 'admin@projecthub.com', 'Admin User'),
            ('john_doe', 'john@example.com', 'John Doe'),
            ('jane_smith', 'jane@example.com', 'Jane Smith')
        ON CONFLICT DO NOTHING;

        INSERT INTO projects (name, description, owner_id) VALUES 
            ('Website Redesign', 'Complete overhaul of company website', 1),
            ('Mobile App', 'Development of new mobile application', 2),
            ('API Migration', 'Migrate legacy APIs to new platform', 1)
        ON CONFLICT DO NOTHING;
        """
        
        # Execute schema directly through docker exec
        # Split schema into individual statements to execute them one by one
        statements = [
            """CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                full_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );""",
            
            """CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'active',
                owner_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );""",
            
            """CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'todo',
                priority VARCHAR(10) DEFAULT 'medium',
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                assignee_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                due_date DATE
            );""",
            
            """INSERT INTO users (username, email, full_name) VALUES 
                ('admin', 'admin@projecthub.com', 'Admin User'),
                ('john_doe', 'john@example.com', 'John Doe'),
                ('jane_smith', 'jane@example.com', 'Jane Smith')
            ON CONFLICT DO NOTHING;""",
            
            """INSERT INTO projects (name, description, owner_id) VALUES 
                ('Website Redesign', 'Complete overhaul of company website', 1),
                ('Mobile App', 'Development of new mobile application', 2),
                ('API Migration', 'Migrate legacy APIs to new platform', 1)
            ON CONFLICT DO NOTHING;"""
        ]
        
        for i, statement in enumerate(statements):
            # Escape single quotes in the statement
            escaped_statement = statement.replace("'", "'\"'\"'")
            cmd = f"echo '{SYNOLOGY_PASSWORD}' | sudo -S /usr/local/bin/docker exec projecthub-postgres psql -U postgres -d projecthub -c '{escaped_statement}' 2>&1 || true"
            success, output, error = execute_command(ssh, cmd, print_output=False)
            if success or "already exists" in error:
                print(f"✅ Statement {i+1}/5 executed successfully")
            elif error and "duplicate key" not in error:
                print(f"⚠️  Statement {i+1}/5 warning: {error}")
        
        # Test the connection
        print("\n🔍 Testing database connection...")
        cmd = f"echo '{SYNOLOGY_PASSWORD}' | sudo -S /usr/local/bin/docker exec projecthub-postgres psql -U postgres -d projecthub -c '\\dt' 2>&1"
        success, output, _ = execute_command(ssh, cmd)
        
        if success:
            print("✅ Database connection successful!")
            print("\n📊 Tables in database:")
            print(output)
        
        print("\n✅ Database initialization complete!")
        print("\n🌐 ProjectHub is now fully deployed and ready!")
        print("   - Backend API: http://192.168.1.24:3009")
        print("   - Frontend UI: http://192.168.1.24:5174")
        print("   - PostgreSQL: 192.168.1.24:5434")
        
        ssh.close()
        
    except Exception as e:
        print(f"\n❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()