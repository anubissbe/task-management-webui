#\!/usr/bin/env python3
import pexpect

ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=120)
ssh.expect(['password:', 'Password:'])
ssh.sendline('JDU9xjn1ekx3rev_uma')
ssh.expect('\\$')

print("Fixing PostCSS configuration...")

# Check current postcss config
ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker exec projecthub-frontend cat postcss.config.js')
ssh.expect('\\$')
print("Current PostCSS config:")
print(ssh.before)

# Create proper postcss config for Tailwind CSS v4
ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > postcss.config.js << 'EOFPOSTCSS'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOFPOSTCSS"''')
ssh.expect('\\$')

# Also check if we can use the older format
ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > postcss.config.cjs << 'EOFPOSTCSS'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOFPOSTCSS"''')
ssh.expect('\\$')

# Remove the problematic config and use the working one
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "rm postcss.config.js && mv postcss.config.cjs postcss.config.js"')
ssh.expect('\\$')

print("Updated PostCSS config. Checking if frontend is still running...")

# Check if container is still running
ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker ps | grep projecthub-frontend')
ssh.expect('\\$')
print("Frontend status:")
print(ssh.before)

ssh.sendline('exit')
ssh.close()

print("\n✅ PostCSS configuration updated\!")
print("The application should now load without Tailwind errors.")
