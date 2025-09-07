'use client';

import React from 'react';
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Client } from '@/types';

interface NavbarProps {
  onMenuClick: () => void;
  client?: Client;
  projectName?: string;
}

export default function Navbar({ onMenuClick, client, projectName }: NavbarProps) {
  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 h-16 flex items-center justify-between px-6">
      {/* Left section - Menu button + breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center space-x-3 text-sm">
          {client && (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide font-medium">Client</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {client.name}
                </span>
              </div>
              {projectName && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">/</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide font-medium">Project</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {projectName}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Center section - Search */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 text-sm transition-all"
            placeholder="Search tasks, projects, or clients..."
          />
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <button className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 relative transition-colors">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Mobile search button */}
        <button className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
