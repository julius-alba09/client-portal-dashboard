'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface DatabaseSource {
  id: string;
  name: string;
  type: 'clients' | 'projects' | 'tasks';
  source: 'notion' | 'demo';
  status: 'connected' | 'disconnected' | 'syncing';
  notionUrl?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  database?: DatabaseSource;
}

interface DatabaseBreadcrumbProps {
  items: BreadcrumbItem[];
  showDatabaseInfo?: boolean;
  className?: string;
}

export default function DatabaseBreadcrumb({
  items,
  showDatabaseInfo = true,
  className = ""
}: DatabaseBreadcrumbProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'syncing':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'notion':
        return '🗃️';
      case 'demo':
        return '📋';
      default:
        return '📄';
    }
  };

  return (
    <div className={clsx("flex flex-col space-y-2", className)}>
      {/* Main breadcrumb navigation */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol role="list" className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={index}>
              <div className="flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" />
                )}
                {item.href && !item.current ? (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={clsx(
                    "text-sm font-medium",
                    item.current 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Database source information */}
      {showDatabaseInfo && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            item.database && (
              <div
                key={`db-${index}`}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2">
                  {/* Database source icon */}
                  <span className="text-sm">{getSourceIcon(item.database.source)}</span>
                  
                  {/* Status indicator */}
                  <div className={clsx(
                    "w-2 h-2 rounded-full",
                    getStatusColor(item.database.status)
                  )} />
                  
                  {/* Database info */}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {item.database.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {item.database.source} • {item.database.status}
                    </span>
                  </div>

                  {/* Notion link */}
                  {item.database.source === 'notion' && item.database.notionUrl && (
                    <a
                      href={item.database.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Open in Notion"
                    >
                      <CircleStackIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to create breadcrumb items with database info
export function createBreadcrumbWithDatabase(
  navigationItems: { label: string; href?: string; current?: boolean }[],
  databaseSources: DatabaseSource[]
): BreadcrumbItem[] {
  return navigationItems.map((item, index) => {
    // Determine which database this breadcrumb item relates to
    let database: DatabaseSource | undefined;
    
    if (item.label.toLowerCase().includes('client')) {
      database = databaseSources.find(db => db.type === 'clients');
    } else if (item.label.toLowerCase().includes('project')) {
      database = databaseSources.find(db => db.type === 'projects');
    } else if (item.label.toLowerCase().includes('task')) {
      database = databaseSources.find(db => db.type === 'tasks');
    }
    
    return {
      ...item,
      database
    };
  });
}

// Default database sources for demo data
export const defaultDatabaseSources: DatabaseSource[] = [
  {
    id: 'demo-clients',
    name: 'Clients (Demo Data)',
    type: 'clients',
    source: 'demo',
    status: 'connected'
  },
  {
    id: 'demo-projects', 
    name: 'Projects (Demo Data)',
    type: 'projects',
    source: 'demo',
    status: 'connected'
  },
  {
    id: 'demo-tasks',
    name: 'Tasks (Demo Data)',
    type: 'tasks',
    source: 'demo', 
    status: 'connected'
  }
];
