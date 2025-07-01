// ProjectHub Modern UI Injection Script
// This script injects modern CSS and JS into the running ProjectHub application

(function() {
  'use strict';
  
  console.log('🎨 ProjectHub Modern UI Injection - Starting...');
  
  // CSS Injection
  function injectModernCSS() {
    // Remove existing modern UI styles if any
    const existingStyles = document.querySelectorAll('#modern-ui-styles, #modern-ui-enhancement');
    existingStyles.forEach(style => style.remove());
    
    const modernCSS = `
    /* ProjectHub Modern UI Enhancement - Injected Styles */
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

    /* Scrollbar Styling */
    * {
      scrollbar-width: thin;
      scrollbar-color: var(--ph-primary) transparent;
    }
    *::-webkit-scrollbar { width: 6px; height: 6px; }
    *::-webkit-scrollbar-track { background: transparent; }
    *::-webkit-scrollbar-thumb { 
      background: var(--ph-primary); 
      border-radius: 3px; 
    }
    *::-webkit-scrollbar-thumb:hover { background: var(--ph-primary-light); }

    /* Enhanced Body */
    body {
      background: #0a0a0a !important;
      background-image: 
        radial-gradient(circle at 20% 20%, rgba(255, 101, 0, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 133, 51, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(255, 101, 0, 0.05) 0%, transparent 50%) !important;
    }

    /* Glass Morphism Cards */
    .modern-card,
    .bg-white, 
    .bg-gray-50, 
    .bg-gray-100,
    [class*="bg-white"],
    .border.rounded-lg,
    .border.rounded-xl,
    .shadow-lg,
    .shadow-xl {
      background: var(--ph-gradient-card) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid var(--ph-border-glass) !important;
      border-radius: 16px !important;
      box-shadow: var(--ph-shadow-glow), 0 8px 32px rgba(0, 0, 0, 0.3) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .modern-card:hover,
    .bg-white:hover, 
    .bg-gray-50:hover, 
    .bg-gray-100:hover,
    [class*="bg-white"]:hover,
    .border.rounded-lg:hover,
    .border.rounded-xl:hover,
    .shadow-lg:hover,
    .shadow-xl:hover {
      transform: translateY(-4px) !important;
      box-shadow: var(--ph-shadow-glow), 0 12px 40px rgba(0, 0, 0, 0.4) !important;
      border-color: rgba(255, 101, 0, 0.4) !important;
    }

    /* Enhanced Header */
    header,
    .sticky.top-0,
    .z-50,
    nav {
      background: var(--ph-surface-dark) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border-bottom: 1px solid var(--ph-border-glass) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
    }

    /* Modern Logo */
    .text-xl, .text-2xl, .font-bold {
      background: var(--ph-gradient-primary) !important;
      background-clip: text !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      font-weight: 800 !important;
    }

    /* Enhanced Buttons */
    .bg-blue-500, 
    .bg-blue-600, 
    .bg-orange-500,
    .bg-primary-500,
    .bg-primary-600,
    button:not(.modern-button-secondary) {
      background: var(--ph-gradient-primary) !important;
      border: none !important;
      border-radius: 12px !important;
      color: white !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-shadow: 0 4px 20px rgba(255, 101, 0, 0.3) !important;
    }

    .bg-blue-500:hover, 
    .bg-blue-600:hover, 
    .bg-orange-500:hover,
    .bg-primary-500:hover,
    .bg-primary-600:hover,
    button:not(.modern-button-secondary):hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 30px rgba(255, 101, 0, 0.4) !important;
    }

    /* Secondary Buttons */
    .bg-gray-200,
    .bg-gray-300,
    .border-gray-300,
    button.modern-button-secondary {
      background: var(--ph-surface-glass) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border: 1px solid var(--ph-border-glass) !important;
      color: var(--ph-text-primary) !important;
      border-radius: 12px !important;
      transition: all 0.3s ease !important;
    }

    .bg-gray-200:hover,
    .bg-gray-300:hover,
    .border-gray-300:hover,
    button.modern-button-secondary:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 101, 0, 0.3) !important;
    }

    /* Enhanced Inputs */
    input, textarea, select {
      background: var(--ph-surface-glass) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border: 1px solid var(--ph-border-glass) !important;
      border-radius: 12px !important;
      color: var(--ph-text-primary) !important;
      transition: all 0.3s ease !important;
    }

    input::placeholder, textarea::placeholder {
      color: var(--ph-text-secondary) !important;
    }

    input:focus, textarea:focus, select:focus {
      outline: none !important;
      border-color: var(--ph-primary) !important;
      box-shadow: 0 0 0 3px rgba(255, 101, 0, 0.1) !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }

    /* Enhanced Tables */
    table {
      background: var(--ph-surface-glass) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid var(--ph-border-glass) !important;
      border-radius: 16px !important;
      overflow: hidden !important;
      box-shadow: var(--ph-shadow-glow) !important;
    }

    thead, .bg-gray-50 {
      background: var(--ph-gradient-primary) !important;
    }

    th {
      color: white !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }

    td {
      color: var(--ph-text-primary) !important;
      border-bottom: 1px solid rgba(255, 101, 0, 0.1) !important;
    }

    tbody tr:hover {
      background: rgba(255, 101, 0, 0.05) !important;
    }

    /* Status Pills */
    .bg-blue-100 {
      background: rgba(59, 130, 246, 0.2) !important;
      color: #93c5fd !important;
      border: 1px solid rgba(59, 130, 246, 0.3) !important;
      border-radius: 20px !important;
      padding: 0.375rem 0.875rem !important;
      font-size: 0.75rem !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      backdrop-filter: blur(10px) !important;
    }

    .bg-green-100 {
      background: rgba(34, 197, 94, 0.2) !important;
      color: #86efac !important;
      border: 1px solid rgba(34, 197, 94, 0.3) !important;
      border-radius: 20px !important;
      padding: 0.375rem 0.875rem !important;
      font-size: 0.75rem !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      backdrop-filter: blur(10px) !important;
    }

    .bg-yellow-100 {
      background: rgba(234, 179, 8, 0.2) !important;
      color: #fde047 !important;
      border: 1px solid rgba(234, 179, 8, 0.3) !important;
      border-radius: 20px !important;
      padding: 0.375rem 0.875rem !important;
      font-size: 0.75rem !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      backdrop-filter: blur(10px) !important;
    }

    .bg-red-100 {
      background: rgba(239, 68, 68, 0.2) !important;
      color: #fca5a5 !important;
      border: 1px solid rgba(239, 68, 68, 0.3) !important;
      border-radius: 20px !important;
      padding: 0.375rem 0.875rem !important;
      font-size: 0.75rem !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      backdrop-filter: blur(10px) !important;
    }

    /* Navigation Links */
    nav a,
    a[class*="text-gray"] {
      position: relative !important;
      padding: 0.75rem 1.5rem !important;
      border-radius: 12px !important;
      transition: all 0.3s ease !important;
      color: var(--ph-text-secondary) !important;
      font-weight: 500 !important;
      text-decoration: none !important;
    }

    nav a:hover,
    nav a.active,
    a[class*="text-gray"]:hover {
      color: var(--ph-text-primary) !important;
      background: rgba(255, 101, 0, 0.1) !important;
      transform: translateY(-1px) !important;
    }

    /* Progress Bars */
    .bg-gray-200 {
      background: rgba(255, 255, 255, 0.1) !important;
      border-radius: 4px !important;
      backdrop-filter: blur(10px) !important;
    }

    .w-full.bg-blue-500,
    .bg-green-500,
    .bg-orange-500 {
      background: var(--ph-gradient-primary) !important;
      border-radius: 4px !important;
      position: relative !important;
      overflow: hidden !important;
    }

    /* Floating Action Button */
    .fab {
      position: fixed !important;
      bottom: 2rem !important;
      right: 2rem !important;
      width: 60px !important;
      height: 60px !important;
      background: var(--ph-gradient-primary) !important;
      border: none !important;
      border-radius: 50% !important;
      color: white !important;
      font-size: 1.5rem !important;
      cursor: pointer !important;
      box-shadow: 0 8px 30px rgba(255, 101, 0, 0.4) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      z-index: 1000 !important;
    }

    .fab:hover {
      transform: translateY(-4px) scale(1.1) !important;
      box-shadow: 0 12px 40px rgba(255, 101, 0, 0.5) !important;
    }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in-up {
      animation: fadeInUp 0.5s ease-out !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .fab {
        bottom: 1rem !important;
        right: 1rem !important;
        width: 50px !important;
        height: 50px !important;
        font-size: 1.25rem !important;
      }
    }

    /* Dark mode text improvements */
    .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6,
    .dark p, .dark span, .dark div {
      color: var(--ph-text-primary) !important;
    }

    .dark .text-gray-500, .dark .text-gray-600, .dark .text-gray-700 {
      color: var(--ph-text-secondary) !important;
    }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'modern-ui-enhancement';
    styleElement.textContent = modernCSS;
    document.head.appendChild(styleElement);
    
    console.log('✨ Modern CSS injected successfully');
  }
  
  // Add floating action button
  function addFloatingActionButton() {
    if (document.querySelector('.fab')) return;
    
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.title = 'Quick Actions';
    fab.setAttribute('aria-label', 'Quick Actions');
    
    fab.addEventListener('click', () => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('projects')) {
        // Try to trigger new project
        const buttons = document.querySelectorAll('button');
        const newProjectBtn = Array.from(buttons).find(btn => 
          btn.textContent.toLowerCase().includes('new') || 
          btn.textContent.toLowerCase().includes('create') ||
          btn.textContent.toLowerCase().includes('add')
        );
        if (newProjectBtn) newProjectBtn.click();
      } else {
        // Generic action - scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    
    document.body.appendChild(fab);
    console.log('🔘 Floating Action Button added');
  }
  
  // Apply enhanced animations
  function applyAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.bg-white, .bg-gray-50, .bg-gray-100, .border.rounded-lg, .shadow-lg');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-fade-in-up');
      }, index * 100);
    });
    
    console.log('🎬 Animations applied to cards');
  }
  
  // Force dark mode for better appearance
  function forceDarkMode() {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    
    // Override any light mode classes
    const lightModeElements = document.querySelectorAll('.bg-white, .bg-gray-50, .bg-gray-100');
    lightModeElements.forEach(el => {
      el.style.setProperty('background', 'var(--ph-gradient-card)', 'important');
      el.style.setProperty('color', 'var(--ph-text-primary)', 'important');
    });
    
    console.log('🌙 Dark mode enforced for modern appearance');
  }
  
  // Main initialization function
  function initializeModernUI() {
    console.log('🚀 Initializing ProjectHub Modern UI Enhancement...');
    
    // Apply all enhancements
    forceDarkMode();
    injectModernCSS();
    addFloatingActionButton();
    applyAnimations();
    
    // Setup observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        setTimeout(() => {
          applyAnimations();
          if (!document.querySelector('.fab')) {
            addFloatingActionButton();
          }
        }, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Re-apply on route changes
    let currentPath = window.location.pathname;
    setInterval(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        setTimeout(() => {
          applyAnimations();
          forceDarkMode();
        }, 1000);
      }
    }, 2000);
    
    console.log('🎉 ProjectHub Modern UI Enhancement completed!');
    
    // Show success notification
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
      animation: fadeInUp 0.5s ease-out;
    `;
    notification.textContent = '✨ Modern UI Enhanced!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeInUp 0.5s ease-out reverse';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
  
  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModernUI);
  } else {
    initializeModernUI();
  }
  
  // Also run after a delay to catch any late-loaded content
  setTimeout(initializeModernUI, 2000);
  
  // Expose global refresh function
  window.refreshModernUI = initializeModernUI;
  
})();