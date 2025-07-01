// ProjectHub Modern UI Injection Script - Safe Version
// This script safely injects modern CSS and JS without causing conflicts

(function() {
  'use strict';
  
  console.log('🎨 ProjectHub Modern UI Injection (Safe Mode) - Starting...');
  
  // Error handler to prevent breaking the app
  function safeExecute(fn, description) {
    try {
      fn();
    } catch (error) {
      console.warn(`⚠️ Modern UI: ${description} failed:`, error.message);
    }
  }
  
  // CSS Injection with conflict prevention
  function injectModernCSS() {
    // Check if already injected
    if (document.querySelector('#modern-ui-enhancement-safe')) {
      console.log('ℹ️ Modern UI CSS already injected, skipping...');
      return;
    }
    
    const modernCSS = `
    /* ProjectHub Modern UI Enhancement - Safe Injected Styles */
    /* Using more specific selectors to avoid conflicts */
    
    :root {
      --ph-primary: #ff6500;
      --ph-primary-light: #ff8533;
      --ph-primary-dark: #cc5200;
      --ph-surface-glass: rgba(255, 255, 255, 0.08);
      --ph-surface-dark: rgba(10, 10, 10, 0.95);
      --ph-text-primary: #ffffff;
      --ph-text-secondary: #a0a0a0;
      --ph-border-glass: rgba(255, 101, 0, 0.2);
      --ph-shadow-glow: 0 0 30px rgba(255, 101, 0, 0.15);
      --ph-gradient-primary: linear-gradient(135deg, #ff6500, #ff8533);
      --ph-gradient-card: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    }

    /* Scrollbar Styling - Safe */
    body::-webkit-scrollbar { width: 6px; height: 6px; }
    body::-webkit-scrollbar-track { background: transparent; }
    body::-webkit-scrollbar-thumb { 
      background: var(--ph-primary); 
      border-radius: 3px; 
    }
    body::-webkit-scrollbar-thumb:hover { background: var(--ph-primary-light); }

    /* Enhanced Body - Without !important to avoid conflicts */
    body.modern-ui-enhanced {
      background: #0a0a0a;
      background-image: 
        radial-gradient(circle at 20% 20%, rgba(255, 101, 0, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 133, 51, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(255, 101, 0, 0.05) 0%, transparent 50%);
      transition: background 0.5s ease;
    }

    /* Glass Morphism Cards - Specific selectors */
    .modern-ui-card {
      background: var(--ph-gradient-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--ph-border-glass);
      border-radius: 16px;
      box-shadow: var(--ph-shadow-glow), 0 8px 32px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .modern-ui-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--ph-shadow-glow), 0 12px 40px rgba(0, 0, 0, 0.4);
      border-color: rgba(255, 101, 0, 0.4);
    }

    /* Enhanced Header - Specific */
    .modern-ui-header {
      background: var(--ph-surface-dark);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--ph-border-glass);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    /* Modern Logo - Specific */
    .modern-ui-logo {
      background: var(--ph-gradient-primary);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }

    /* Enhanced Buttons - Specific */
    .modern-ui-button {
      background: var(--ph-gradient-primary);
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(255, 101, 0, 0.3);
    }

    .modern-ui-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(255, 101, 0, 0.4);
    }

    /* Secondary Buttons - Specific */
    .modern-ui-button-secondary {
      background: var(--ph-surface-glass);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid var(--ph-border-glass);
      color: var(--ph-text-primary);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .modern-ui-button-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 101, 0, 0.3);
    }

    /* Enhanced Inputs - Specific */
    .modern-ui-input {
      background: var(--ph-surface-glass);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid var(--ph-border-glass);
      border-radius: 12px;
      color: var(--ph-text-primary);
      transition: all 0.3s ease;
    }

    .modern-ui-input:focus {
      outline: none;
      border-color: var(--ph-primary);
      box-shadow: 0 0 0 3px rgba(255, 101, 0, 0.1);
      background: rgba(255, 255, 255, 0.1);
    }

    /* Enhanced Tables - Specific */
    .modern-ui-table {
      background: var(--ph-surface-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--ph-border-glass);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--ph-shadow-glow);
    }

    .modern-ui-table thead {
      background: var(--ph-gradient-primary);
    }

    .modern-ui-table th {
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .modern-ui-table tbody tr:hover {
      background: rgba(255, 101, 0, 0.05);
    }

    /* Status Pills - Specific */
    .modern-ui-status {
      padding: 0.375rem 0.875rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .modern-ui-status-progress {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .modern-ui-status-completed {
      background: rgba(34, 197, 94, 0.2);
      color: #86efac;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .modern-ui-status-pending {
      background: rgba(234, 179, 8, 0.2);
      color: #fde047;
      border: 1px solid rgba(234, 179, 8, 0.3);
    }

    .modern-ui-status-blocked {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    /* Navigation Links - Specific */
    .modern-ui-nav-link {
      position: relative;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      color: var(--ph-text-secondary);
      font-weight: 500;
      text-decoration: none;
    }

    .modern-ui-nav-link:hover,
    .modern-ui-nav-link.active {
      color: var(--ph-text-primary);
      background: rgba(255, 101, 0, 0.1);
      transform: translateY(-1px);
    }

    /* Floating Action Button - Specific */
    .modern-ui-fab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 60px;
      height: 60px;
      background: var(--ph-gradient-primary);
      border: none;
      border-radius: 50%;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 8px 30px rgba(255, 101, 0, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 999;
    }

    .modern-ui-fab:hover {
      transform: translateY(-4px) scale(1.1);
      box-shadow: 0 12px 40px rgba(255, 101, 0, 0.5);
    }

    /* Animations */
    @keyframes modernUIFadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modern-ui-animate-fade-in-up {
      animation: modernUIFadeInUp 0.5s ease-out;
    }

    /* Dark mode text improvements - Specific */
    body.modern-ui-enhanced h1,
    body.modern-ui-enhanced h2,
    body.modern-ui-enhanced h3,
    body.modern-ui-enhanced h4,
    body.modern-ui-enhanced h5,
    body.modern-ui-enhanced h6,
    body.modern-ui-enhanced p,
    body.modern-ui-enhanced span,
    body.modern-ui-enhanced div {
      color: var(--ph-text-primary);
    }

    body.modern-ui-enhanced .text-gray-500,
    body.modern-ui-enhanced .text-gray-600,
    body.modern-ui-enhanced .text-gray-700 {
      color: var(--ph-text-secondary);
    }

    /* Mobile responsive - Specific */
    @media (max-width: 768px) {
      .modern-ui-fab {
        bottom: 1rem;
        right: 1rem;
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
      }
    }

    /* Subtle override styles */
    body.modern-ui-enhanced .bg-white,
    body.modern-ui-enhanced .bg-gray-50,
    body.modern-ui-enhanced .bg-gray-100 {
      background: var(--ph-gradient-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    body.modern-ui-enhanced button.bg-blue-500,
    body.modern-ui-enhanced button.bg-blue-600,
    body.modern-ui-enhanced button.bg-orange-500 {
      background: var(--ph-gradient-primary);
      border: none;
      box-shadow: 0 4px 20px rgba(255, 101, 0, 0.3);
    }

    body.modern-ui-enhanced input,
    body.modern-ui-enhanced textarea,
    body.modern-ui-enhanced select {
      background: var(--ph-surface-glass);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-color: var(--ph-border-glass);
    }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'modern-ui-enhancement-safe';
    styleElement.textContent = modernCSS;
    document.head.appendChild(styleElement);
    
    console.log('✨ Modern CSS (Safe) injected successfully');
  }
  
  // Apply classes without breaking existing functionality
  function applyModernClasses() {
    // Add body class
    document.body.classList.add('modern-ui-enhanced');
    
    // Safely enhance cards
    safeExecute(() => {
      const cards = document.querySelectorAll('.bg-white, .bg-gray-50, .bg-gray-100, .border.rounded-lg');
      cards.forEach((card, index) => {
        if (!card.classList.contains('modern-ui-card')) {
          card.classList.add('modern-ui-card', 'modern-ui-animate-fade-in-up');
          card.style.animationDelay = `${index * 0.05}s`;
        }
      });
    }, 'Card enhancement');
    
    // Safely enhance buttons
    safeExecute(() => {
      const primaryButtons = document.querySelectorAll('button.bg-blue-500, button.bg-blue-600, button.bg-orange-500');
      primaryButtons.forEach(btn => {
        if (!btn.classList.contains('modern-ui-button')) {
          btn.classList.add('modern-ui-button');
        }
      });
      
      const secondaryButtons = document.querySelectorAll('button.bg-gray-200, button.bg-gray-300');
      secondaryButtons.forEach(btn => {
        if (!btn.classList.contains('modern-ui-button-secondary')) {
          btn.classList.add('modern-ui-button-secondary');
        }
      });
    }, 'Button enhancement');
    
    // Safely enhance inputs
    safeExecute(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, select');
      inputs.forEach(input => {
        if (!input.classList.contains('modern-ui-input')) {
          input.classList.add('modern-ui-input');
        }
      });
    }, 'Input enhancement');
    
    // Safely enhance tables
    safeExecute(() => {
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        if (!table.classList.contains('modern-ui-table')) {
          table.classList.add('modern-ui-table');
        }
      });
    }, 'Table enhancement');
    
    // Safely enhance headers
    safeExecute(() => {
      const headers = document.querySelectorAll('header, .sticky.top-0');
      headers.forEach(header => {
        if (!header.classList.contains('modern-ui-header')) {
          header.classList.add('modern-ui-header');
        }
      });
    }, 'Header enhancement');
    
    // Safely enhance navigation links
    safeExecute(() => {
      const navLinks = document.querySelectorAll('nav a');
      navLinks.forEach(link => {
        if (!link.classList.contains('modern-ui-nav-link')) {
          link.classList.add('modern-ui-nav-link');
        }
      });
    }, 'Navigation enhancement');
    
    console.log('🎨 Modern UI classes applied safely');
  }
  
  // Add floating action button safely
  function addFloatingActionButton() {
    if (document.querySelector('.modern-ui-fab')) return;
    
    safeExecute(() => {
      const fab = document.createElement('button');
      fab.className = 'modern-ui-fab';
      fab.innerHTML = '+';
      fab.title = 'Quick Actions';
      fab.setAttribute('aria-label', 'Quick Actions');
      
      fab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        safeExecute(() => {
          const buttons = document.querySelectorAll('button');
          const actionBtn = Array.from(buttons).find(btn => {
            const text = btn.textContent.toLowerCase();
            return text.includes('new') || text.includes('create') || text.includes('add');
          });
          
          if (actionBtn) {
            actionBtn.click();
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 'FAB click action');
      });
      
      document.body.appendChild(fab);
      console.log('🔘 Floating Action Button added safely');
    }, 'Add FAB');
  }
  
  // Safe dark mode application
  function applyDarkMode() {
    safeExecute(() => {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      console.log('🌙 Dark mode applied safely');
    }, 'Apply dark mode');
  }
  
  // Safe observer for dynamic content
  function setupSafeObserver() {
    let updateTimeout;
    
    const observer = new MutationObserver((mutations) => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        applyModernClasses();
      }, 500);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    console.log('👀 Safe mutation observer setup');
  }
  
  // Show success notification
  function showSuccessNotification() {
    safeExecute(() => {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--ph-gradient-primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(255, 101, 0, 0.4);
        z-index: 10000;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.5s ease;
      `;
      notification.textContent = '✨ Modern UI Enhanced Safely!';
      document.body.appendChild(notification);
      
      // Fade in
      setTimeout(() => { notification.style.opacity = '1'; }, 100);
      
      // Fade out and remove
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
      }, 3000);
    }, 'Show notification');
  }
  
  // Main initialization function
  function initializeModernUISafe() {
    console.log('🚀 Initializing ProjectHub Modern UI Enhancement (Safe Mode)...');
    
    // Apply all enhancements with error handling
    safeExecute(injectModernCSS, 'CSS injection');
    
    // Wait for DOM to stabilize
    setTimeout(() => {
      safeExecute(applyDarkMode, 'Dark mode');
      safeExecute(applyModernClasses, 'Class application');
      safeExecute(addFloatingActionButton, 'FAB addition');
      safeExecute(setupSafeObserver, 'Observer setup');
      safeExecute(showSuccessNotification, 'Success notification');
      
      console.log('🎉 ProjectHub Modern UI Enhancement (Safe Mode) completed!');
    }, 1000);
    
    // Re-apply on route changes
    let currentPath = window.location.pathname;
    setInterval(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        setTimeout(() => {
          safeExecute(applyModernClasses, 'Route change class application');
        }, 1000);
      }
    }, 2000);
  }
  
  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModernUISafe);
  } else {
    // Delay to ensure React app is loaded
    setTimeout(initializeModernUISafe, 2000);
  }
  
  // Expose safe refresh function
  window.refreshModernUISafe = () => {
    console.log('🔄 Manually refreshing Modern UI (Safe Mode)...');
    safeExecute(applyModernClasses, 'Manual refresh');
  };
  
})();