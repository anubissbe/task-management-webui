#\!/usr/bin/env python3
import pexpect

print("🔧 Fixing Tailwind CSS configuration...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=120)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Fix PostCSS configuration
    print("✓ Installing @tailwindcss/postcss...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker exec projecthub-frontend sh -c "npm install @tailwindcss/postcss"')
    ssh.expect('\\$', timeout=60)
    
    # Update postcss.config.js
    print("✓ Updating PostCSS configuration...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > postcss.config.js << 'EOFPOSTCSS'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOFPOSTCSS"''')
    ssh.expect('\\$')
    
    # Alternative: try the new format
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > postcss.config.js << 'EOFPOSTCSS'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
  ],
}
EOFPOSTCSS"''')
    ssh.expect('\\$')
    
    # Also try installing the latest tailwindcss
    print("✓ Updating Tailwind CSS...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "npm install tailwindcss@latest @tailwindcss/postcss autoprefixer"')
    ssh.expect('\\$', timeout=90)
    
    # Restart the frontend development server
    print("✓ Restarting frontend...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker restart projecthub-frontend')
    ssh.expect('\\$', timeout=30)
    
    print("✓ Waiting for frontend to restart...")
    import time
    time.sleep(15)
    
    # Check logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-frontend --tail 20')
    ssh.expect('\\$', timeout=30)
    print("\nFrontend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Tailwind CSS configuration fixed\!")
    print("The PostCSS error should be resolved. Refresh your browser to see the updated application.")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
