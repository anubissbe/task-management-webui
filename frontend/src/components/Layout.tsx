import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import clsx from 'clsx';

export const Layout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-black px-3 py-1 rounded-lg flex items-center space-x-1">
                    <span className="text-white font-bold text-lg">Project</span>
                    <span className="text-orange-500 font-bold text-lg">hub</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      MCP Enhanced Workspace
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={clsx(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    isActive('/')
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  Projects
                </Link>
                <Link
                  to="/board"
                  className={clsx(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    isActive('/board')
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  Board
                </Link>
                <Link
                  to="/analytics"
                  className={clsx(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    isActive('/analytics')
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  Analytics
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
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-black px-2 py-1 rounded flex items-center space-x-1">
                  <span className="text-white font-bold text-xs">Project</span>
                  <span className="text-orange-500 font-bold text-xs">hub</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200 rounded-full">
                  🔗 MCP Enhanced
                </span>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  ✅ Production Ready
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Powered by MCP Protocol
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};