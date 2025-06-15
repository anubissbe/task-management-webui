import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import clsx from 'clsx';

export const Layout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <nav className="bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-orange-500 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-black to-gray-800 px-4 py-2 rounded-lg flex items-center space-x-1 border border-orange-500/30 shadow-md">
                    <span className="text-white font-bold text-xl tracking-wide">Project</span>
                    <span className="text-orange-500 font-bold text-xl tracking-wide">hub</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs text-orange-300 font-medium">
                      MCP Enhanced Workspace
                    </p>
                    <p className="text-xs text-gray-400">
                      Project Management Evolved
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={clsx(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200',
                    isActive('/')
                      ? 'border-orange-500 text-white shadow-sm'
                      : 'border-transparent text-gray-300 hover:text-orange-300 hover:border-orange-400'
                  )}
                >
                  📁 Projects
                </Link>
                <Link
                  to="/board"
                  className={clsx(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200',
                    isActive('/board')
                      ? 'border-orange-500 text-white shadow-sm'
                      : 'border-transparent text-gray-300 hover:text-orange-300 hover:border-orange-400'
                  )}
                >
                  📋 Board
                </Link>
                <Link
                  to="/analytics"
                  className={clsx(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200',
                    isActive('/analytics')
                      ? 'border-orange-500 text-white shadow-sm'
                      : 'border-transparent text-gray-300 hover:text-orange-300 hover:border-orange-400'
                  )}
                >
                  📊 Analytics
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
      
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t-2 border-orange-500/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-black to-gray-800 px-3 py-1 rounded-lg flex items-center space-x-1 border border-orange-500/30">
                  <span className="text-white font-bold text-sm">Project</span>
                  <span className="text-orange-500 font-bold text-sm">hub</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full">
                  🔗 MCP Enhanced
                </span>
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 rounded-full">
                  ✅ Production Ready
                </span>
              </div>
            </div>
            <div className="text-xs text-orange-300 font-medium">
              Powered by MCP Protocol ⚡
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};