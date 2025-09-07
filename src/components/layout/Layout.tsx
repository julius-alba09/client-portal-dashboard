'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Client } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  client?: Client;
  projectName?: string;
}

export default function Layout({ children, client, projectName }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)}
          client={client}
          projectName={projectName}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
