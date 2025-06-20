import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

export const Layout: React.FC = () => {
  const location = useLocation();
  const logoRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  useEffect(() => {
    const logoElement = logoRef.current;
    if (logoElement) {
      const handleLogoClick = () => {
        window.location.href = '/';
      };
      logoElement.addEventListener('click', handleLogoClick);
      return () => logoElement.removeEventListener('click', handleLogoClick);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-orange-50/5 to-gray-50 dark:from-black dark:via-orange-950/10 dark:to-gray-950">
      <nav className="projecthub-header sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-4">
                  <div 
                    ref={logoRef}
                    className="projecthub-logo px-6 py-4 rounded-2xl flex items-center space-x-3 transform hover:scale-110 transition-all duration-300 cursor-pointer group"
                  >
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
                <Link
                  to="/webhooks"
                  className={clsx(
                    'projecthub-nav-link inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105',
                    isActive('/webhooks')
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-lg shadow-orange-500/20'
                      : 'text-gray-300 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent'
                  )}
                >
                  <span className="text-lg mr-2">🔗</span>
                  <span className="uppercase tracking-wider">Webhooks</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-sm text-gray-300 hover:text-orange-400 bg-gray-800/50 hover:bg-orange-500/10 px-4 py-2 rounded-lg border border-gray-600 hover:border-orange-500/50 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="font-medium">{user?.first_name} {user?.last_name}</div>
                    <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                        {user?.role}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
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
                <div className="bg-gradient-to-r from-orange-950/50 to-black px-4 py-2 rounded-xl flex items-center space-x-2 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20">
                  <span className="text-white font-black text-base">Project</span>
                  <span className="text-orange-500 font-black text-base">Hub</span>
                  <span className="text-orange-400/70 font-bold text-sm">MCP</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="inline-flex items-center px-4 py-2 text-xs font-bold bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-300 border border-orange-500/50 rounded-full shadow-md transform hover:scale-105 transition-all">
                  🔗 MCP ENHANCED
                </span>
                <span className="inline-flex items-center px-4 py-2 text-xs font-bold bg-gradient-to-r from-gray-600/30 to-gray-700/20 text-gray-300 border border-gray-500/50 rounded-full shadow-md transform hover:scale-105 transition-all">
                  ⚡ PRODUCTION
                </span>
              </div>
            </div>
            <div className="text-sm text-orange-400 font-bold uppercase tracking-wider animate-pulse-slow">
              Powered by MCP Protocol ⚡
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};