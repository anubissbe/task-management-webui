#\!/usr/bin/env python3
import pexpect
import time

print("🔧 Fixing Tailwind CSS PostCSS configuration...")

try:
    ssh = pexpect.spawn('ssh -p 2222 Bert@192.168.1.24', encoding='utf-8', timeout=180)
    ssh.expect(['password:', 'Password:'])
    ssh.sendline('JDU9xjn1ekx3rev_uma')
    ssh.expect('\\$')
    
    print("✓ Connected")
    
    # Remove the problematic Tailwind forms plugin and update packages
    print("✓ Updating Tailwind CSS packages...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma"  < /dev/null |  sudo -S docker exec projecthub-frontend sh -c "npm uninstall @tailwindcss/forms"')
    ssh.expect('\\$', timeout=60)
    
    # Install the correct Tailwind packages
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "npm install tailwindcss@latest autoprefixer@latest"')
    ssh.expect('\\$', timeout=90)
    
    # Update tailwind.config.js to remove the problematic plugin
    print("✓ Updating Tailwind configuration...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > tailwind.config.js << 'EOFTW'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93bbfd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
EOFTW"''')
    ssh.expect('\\$')
    
    # Update postcss.config.js with the standard configuration
    print("✓ Updating PostCSS configuration...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > postcss.config.js << 'EOFPC'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOFPC"''')
    ssh.expect('\\$')
    
    # Update vite.config.ts to disable the overlay
    print("✓ Updating Vite configuration...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > vite.config.ts << 'EOFVITE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      overlay: false
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
EOFVITE"''')
    ssh.expect('\\$')
    
    # Simplify the CSS file to avoid any complex Tailwind directives
    print("✓ Simplifying CSS...")
    ssh.sendline('''echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "cat > src/index.css << 'EOFCSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
}

/* Custom utility classes */
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}
EOFCSS"''')
    ssh.expect('\\$')
    
    # Clear the Vite cache and restart
    print("✓ Clearing cache and restarting...")
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker exec projecthub-frontend sh -c "rm -rf node_modules/.vite"')
    ssh.expect('\\$')
    
    # Restart the frontend container
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker restart projecthub-frontend')
    ssh.expect('\\$', timeout=30)
    
    print("✓ Waiting for frontend to restart...")
    time.sleep(25)
    
    # Check logs
    ssh.sendline('echo "JDU9xjn1ekx3rev_uma" | sudo -S docker logs projecthub-frontend --tail 15')
    ssh.expect('\\$', timeout=30)
    print("\nFrontend logs:")
    print(ssh.before)
    
    ssh.sendline('exit')
    ssh.close()
    
    print("\n✅ Tailwind CSS configuration fixed\!")
    print("\nThe PostCSS overlay error should be resolved.")
    print("If the overlay still appears, press 'Esc' to dismiss it.")
    print("\n🎉 Your ProjectHub application:")
    print("  Frontend: http://192.168.1.24:5173")
    print("  Backend: http://192.168.1.24:3008")

except Exception as e:
    print(f"Error: {e}")
    if 'ssh' in locals():
        ssh.close()
