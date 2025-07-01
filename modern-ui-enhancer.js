// ProjectHub Modern UI Enhancer
// Dynamically applies modern, sleek styling to the existing React application

(function() {
  'use strict';
  
  console.log('🎨 ProjectHub Modern UI Enhancer - Loading...');
  
  // Apply modern UI enhancements
  function applyModernUI() {
    // Enhanced selectors and class mappings
    const uiEnhancements = {
      // Cards and containers
      cards: [
        '.bg-white', '.bg-gray-100', '.bg-gray-50',
        '[class*="bg-white"]', '[class*="bg-gray-"]',
        '.border', '.rounded-lg', '.rounded-xl', '.rounded-2xl',
        '.shadow', '.shadow-lg', '.shadow-xl'
      ],
      
      // Buttons
      buttons: [
        'button', '.btn', '[role="button"]',
        '.bg-blue-500', '.bg-blue-600', '.bg-orange-500',
        '.bg-primary-500', '.bg-primary-600'
      ],
      
      // Navigation
      navigation: [
        'nav a', '.nav-link', '[role="navigation"] a',
        '.text-gray-600', '.text-gray-700', '.hover\\:text-gray-900'
      ],
      
      // Input fields
      inputs: [
        'input[type="text"]', 'input[type="email"]', 'input[type="password"]',
        'input[type="search"]', 'textarea', 'select',
        '.form-input', '.form-control'
      ],
      
      // Tables
      tables: [
        'table', '.table',
        'thead', 'th', 'tbody', 'tr', 'td'
      ],
      
      // Headers
      headers: [
        'header', '.header', '.app-header',
        '.sticky', '.top-0', '.z-50'
      ]
    };
    
    // Apply card styling
    uiEnhancements.cards.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (!el.classList.contains('modern-card') && !el.classList.contains('kanban-card')) {
            el.classList.add('modern-card', 'animate-fade-in-up');
          }
        });
      } catch (e) { /* Ignore invalid selectors */ }
    });
    
    // Apply button styling
    uiEnhancements.buttons.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') {
            if (el.classList.contains('bg-blue-500') || 
                el.classList.contains('bg-blue-600') || 
                el.classList.contains('bg-orange-500') ||
                el.classList.contains('bg-primary-500') ||
                el.classList.contains('bg-primary-600')) {
              el.classList.add('modern-button');
            } else {
              el.classList.add('modern-button-secondary');
            }
          }
        });
      } catch (e) { /* Ignore invalid selectors */ }
    });
    
    // Apply navigation styling
    uiEnhancements.navigation.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (el.tagName === 'A' && el.closest('nav')) {
            el.classList.add('modern-nav-link');
          }
        });
      } catch (e) { /* Ignore invalid selectors */ }
    });
    
    // Apply input styling
    uiEnhancements.inputs.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          el.classList.add('modern-input');
        });
      } catch (e) { /* Ignore invalid selectors */ }
    });
    
    // Apply table styling
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      if (!table.classList.contains('modern-table')) {
        table.classList.add('modern-table');
        table.parentElement?.classList.add('animate-fade-in-up');
      }
    });
    
    // Apply header styling
    uiEnhancements.headers.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          el.classList.add('modern-header');
        });
      } catch (e) { /* Ignore invalid selectors */ }
    });
    
    // Enhance logo
    const logos = document.querySelectorAll('[class*="logo"], .text-xl, .text-2xl, .font-bold');
    logos.forEach(logo => {
      if (logo.textContent && logo.textContent.toLowerCase().includes('project')) {
        logo.classList.add('modern-logo');
      }
    });
    
    // Add status pills to appropriate elements
    const statusElements = document.querySelectorAll('.bg-blue-100, .bg-green-100, .bg-yellow-100, .bg-red-100, .bg-gray-100');
    statusElements.forEach(el => {
      const text = el.textContent?.toLowerCase();
      el.classList.add('modern-status-pill');
      
      if (text?.includes('todo') || text?.includes('pending')) {
        el.classList.add('status-todo');
      } else if (text?.includes('progress') || text?.includes('working')) {
        el.classList.add('status-in-progress');
      } else if (text?.includes('complete') || text?.includes('done')) {
        el.classList.add('status-completed');
      } else if (text?.includes('block') || text?.includes('stuck')) {
        el.classList.add('status-blocked');
      }
    });
    
    // Enhanced progress bars
    const progressBars = document.querySelectorAll('.bg-blue-500, .bg-green-500, .bg-orange-500');
    progressBars.forEach(bar => {
      if (bar.parentElement?.classList.contains('bg-gray-200') || 
          bar.parentElement?.classList.contains('bg-gray-300')) {
        bar.parentElement.classList.add('modern-progress');
        bar.classList.add('modern-progress-bar');
      }
    });
    
    // Enhance Kanban cards
    const kanbanCards = document.querySelectorAll('[draggable="true"], .draggable, .kanban-card');
    kanbanCards.forEach(card => {
      card.classList.add('kanban-card', 'animate-slide-in-right');
    });
    
    // Add tooltips to buttons and interactive elements
    const interactiveElements = document.querySelectorAll('button[title], a[title], [data-tooltip]');
    interactiveElements.forEach(el => {
      el.classList.add('tooltip');
      if (!el.dataset.tooltip && el.title) {
        el.dataset.tooltip = el.title;
        el.removeAttribute('title');
      }
    });
    
    console.log('✨ Modern UI enhancements applied successfully');
  }
  
  // Add floating action button
  function addFloatingActionButton() {
    if (document.querySelector('.fab')) return;
    
    const fab = document.createElement('button');
    fab.className = 'fab tooltip';
    fab.innerHTML = '+';
    fab.dataset.tooltip = 'Quick Actions';
    fab.setAttribute('aria-label', 'Quick Actions');
    
    fab.addEventListener('click', () => {
      // You can customize this action
      const currentPath = window.location.pathname;
      if (currentPath.includes('projects')) {
        // Trigger new project creation
        const newProjectBtn = document.querySelector('[data-testid="new-project"], button:contains("New Project")');
        if (newProjectBtn) newProjectBtn.click();
      } else if (currentPath.includes('kanban')) {
        // Trigger new task creation
        const newTaskBtn = document.querySelector('[data-testid="new-task"], button:contains("New Task")');
        if (newTaskBtn) newTaskBtn.click();
      }
    });
    
    document.body.appendChild(fab);
  }
  
  // Add loading skeleton for better UX
  function addLoadingSkeletons() {
    const containers = document.querySelectorAll('[class*="loading"], .animate-pulse');
    containers.forEach(container => {
      const children = container.querySelectorAll('div, span, p');
      children.forEach(child => {
        if (child.textContent.trim() === '' || child.classList.contains('animate-pulse')) {
          child.classList.add('skeleton');
        }
      });
    });
  }
  
  // Enhanced theme detection and application
  function enhanceTheme() {
    const isDark = document.documentElement.classList.contains('dark') || 
                   document.body.classList.contains('dark') ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDark) {
      document.body.classList.add('dark');
      console.log('🌙 Dark theme detected and enhanced');
    } else {
      document.body.classList.remove('dark');
      console.log('☀️ Light theme detected and enhanced');
    }
  }
  
  // Performance optimized observer
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        // Debounce the update
        clearTimeout(window.modernUIUpdateTimeout);
        window.modernUIUpdateTimeout = setTimeout(() => {
          applyModernUI();
          addLoadingSkeletons();
        }, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    console.log('👀 Mutation observer setup for dynamic content');
  }
  
  // Initialize modern UI
  function initModernUI() {
    console.log('🚀 Initializing ProjectHub Modern UI...');
    
    // Apply initial enhancements
    enhanceTheme();
    applyModernUI();
    addFloatingActionButton();
    addLoadingSkeletons();
    
    // Setup observers for dynamic content
    setupMutationObserver();
    
    // Theme change listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', enhanceTheme);
    
    // Re-apply on route changes (for SPAs)
    let currentPath = window.location.pathname;
    setInterval(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        setTimeout(() => {
          applyModernUI();
          addLoadingSkeletons();
        }, 500);
      }
    }, 1000);
    
    console.log('🎉 ProjectHub Modern UI initialized successfully!');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModernUI);
  } else {
    initModernUI();
  }
  
  // Also initialize after a delay to catch late-loaded content
  setTimeout(initModernUI, 2000);
  
  // Expose global function for manual refresh
  window.refreshModernUI = () => {
    console.log('🔄 Manually refreshing Modern UI...');
    applyModernUI();
    addLoadingSkeletons();
  };
  
})();