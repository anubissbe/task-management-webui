import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import clsx from 'clsx';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-orange-50/5 to-gray-50 dark:from-black dark:via-orange-950/10 dark:to-gray-950">
      <nav className="projecthub-header sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-4">
                  <div onClick={handleLogoClick} className="projecthub-logo px-6 py-4 rounded-2xl flex items-center space-x-3 transform hover:scale-110 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center space-x-1">
                      <span className="text-white font-black text-3xl tracking-tight drop-shadow-lg group-hover:text-gray-100 transition-colors">Project</span>
                      <span className="text-orange-500 font-black text-3xl tracking-tight drop-shadow-lg animate-pulse-slow">Hub</span>
                    </div>
                    <div className="hidden lg:flex items-center">
                      <span className="text-orange-400 text-2xl font-bold">—</span>
                      <span className="text-gray-300 font-semibold text-lg ml-2">MCP</span>
                    </div>
                  </div>
                  <div className="hidden md:block ml-4">
                    <p className="text-sm text-orange-400 font-bold tracking-wide uppercase animate-fade-in">
                      MCP Enhanced
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Next-Gen Project Management
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={clsx(
                    'projecthub-nav-link inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105',
                    isActive('/')
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-lg shadow-orange-500/20'
                      : 'text-gray-300 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent'
                  )}
                >
                  <span className="text-lg mr-2">📁</span>
                  <span className="uppercase tracking-wider">Projects</span>
                </Link>
                <Link
                  to="/board"
                  className={clsx(
                    'projecthub-nav-link inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105',
                    isActive('/board')
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-lg shadow-orange-500/20'
                      : 'text-gray-300 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent'
                  )}
                >
                  <span className="text-lg mr-2">📋</span>
                  <span className="uppercase tracking-wider">Board</span>
                </Link>
                <Link
                  to="/analytics"
                  className={clsx(
                    'projecthub-nav-link inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105',
                    isActive('/analytics')
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-lg shadow-orange-500/20'
                      : 'text-gray-300 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent'
                  )}
                >
                  <span className="text-lg mr-2">📊</span>
                  <span className="uppercase tracking-wider">Analytics</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full overflow-auto text-gray-900 dark:text-gray-100">
        <Outlet />
      </main>
      
      <footer className="bg-gradient-to-r from-black via-gray-900 to-black border-t-4 border-orange-500/70 mt-auto shadow-2xl shadow-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <a 
                  href="https://github.com/anubissbe/ProjectHub-Mcp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-orange-950/50 to-black px-4 py-2 rounded-xl flex items-center space-x-2 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 hover:border-orange-400 hover:shadow-orange-400/30 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-white font-black text-base">Project</span>
                  <span className="text-orange-500 font-black text-base">Hub</span>
                  <span className="text-orange-400/70 font-bold text-sm">MCP</span>
                </a>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="inline-flex items-center px-4 py-2 text-xs font-bold bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-300 border border-orange-500/50 rounded-full shadow-md transform hover:scale-105 transition-all">
                  🔗 MCP ENHANCED
                </span>
                <span className="inline-flex items-center px-4 py-2 text-xs font-bold bg-gradient-to-r from-green-500/30 to-green-600/20 text-green-300 border border-green-500/50 rounded-full shadow-md transform hover:scale-105 transition-all">
                  ✅ PRODUCTION
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/anubissbe/ProjectHub-Mcp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 hover:border-orange-400 transition-all duration-300 transform hover:scale-110"
                aria-label="View on GitHub"
              >
                <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <div className="text-sm text-orange-400 font-bold uppercase tracking-wider animate-pulse-slow">
                Powered by MCP Protocol ⚡
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};