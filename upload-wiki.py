#!/usr/bin/env python3
"""
Script to upload wiki pages to GitHub wiki via git commands.
Since GitHub wiki uses a separate git repository, we need to clone it and push content.
"""

import os
import subprocess
import sys
import tempfile
import shutil

def run_command(cmd, cwd=None):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command: {cmd}")
        print(f"Exception: {e}")
        return False

def main():
    # Get current directory
    project_dir = "/opt/projects/projects/task-management-webui"
    wiki_source = os.path.join(project_dir, "wiki")
    
    if not os.path.exists(wiki_source):
        print(f"Wiki source directory not found: {wiki_source}")
        return 1
    
    # Create temporary directory for wiki repository
    with tempfile.TemporaryDirectory() as temp_dir:
        wiki_repo = os.path.join(temp_dir, "wiki")
        
        print("Initializing wiki repository...")
        if not run_command(f"git init {wiki_repo}"):
            return 1
        
        # Configure git
        if not run_command("git config user.name 'Claude Code'", cwd=wiki_repo):
            return 1
        if not run_command("git config user.email 'noreply@anthropic.com'", cwd=wiki_repo):
            return 1
        
        # Add remote
        if not run_command("git remote add origin https://github.com/anubissbe/task-management-webui.wiki.git", cwd=wiki_repo):
            return 1
        
        # Copy wiki files
        print("Copying wiki files...")
        for filename in os.listdir(wiki_source):
            if filename.endswith('.md'):
                src = os.path.join(wiki_source, filename)
                dst = os.path.join(wiki_repo, filename)
                shutil.copy2(src, dst)
                print(f"Copied: {filename}")
        
        # Add and commit files
        print("Adding and committing files...")
        if not run_command("git add .", cwd=wiki_repo):
            return 1
        
        commit_message = """Initial wiki documentation with comprehensive guides

This commit adds the complete wiki documentation for the Task Management WebUI project:

- Home: Main wiki homepage with navigation structure
- Installation Guide: Complete installation instructions
- User Interface Overview: Comprehensive UI guide
- API Documentation: Full REST API reference
- Architecture Overview: Technical architecture documentation
- Task Management: Complete task management workflows
- Project Management: Project management strategies
- Analytics Dashboard: Analytics features guide
- Development Setup: Development environment setup
- Production Deployment: Production deployment guide
- FAQ: Frequently asked questions
- Troubleshooting: Comprehensive troubleshooting guide

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"""
        
        if not run_command(f'git commit -m "{commit_message}"', cwd=wiki_repo):
            return 1
        
        # Try to push
        print("Pushing to GitHub wiki...")
        if not run_command("git push -u origin master", cwd=wiki_repo):
            print("Push failed - this is expected if wiki doesn't exist yet.")
            print("You need to create the first wiki page manually on GitHub first.")
            print("Then run this script again.")
            return 1
        
        print("Wiki uploaded successfully!")
        return 0

if __name__ == "__main__":
    sys.exit(main())