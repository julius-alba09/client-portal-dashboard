'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface SearchResult {
  type: 'client' | 'project' | 'task';
  id: string;
  title: string;
  description?: string;
  url: string;
  metadata?: {
    client?: string;
    project?: string;
    status?: string;
    priority?: string;
    databaseSource: 'notion' | 'demo';
    databaseName?: string;
  };
}

interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    results: SearchResult[];
    total: number;
    databases: Array<{
      id: string;
      name: string;
      type: string;
      source: string;
      status: string;
    }>;
  };
}

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
  isMobile?: boolean;
}

export default function SearchBox({ 
  className = "",
  placeholder = "Search tasks, projects, or clients...",
  isMobile = false
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [databases, setDatabases] = useState<SearchResponse['data']['databases']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Search function with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setDatabases([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
        const data: SearchResponse = await response.json();
        
        if (data.success) {
          setResults(data.data.results);
          setDatabases(data.data.databases);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setDatabases([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToResult = (result: SearchResult) => {
    router.push(result.url);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'client':
        return '👤';
      case 'project':
        return '📁';
      case 'task':
        return '✅';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string, priority?: string) => {
    if (priority === 'urgent') return 'text-red-600 dark:text-red-400';
    if (priority === 'high') return 'text-orange-600 dark:text-orange-400';
    
    switch (status) {
      case 'done':
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400';
      case 'blocked':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div ref={searchRef} className={clsx("relative", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowResults(true)}
          className={clsx(
            "block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 text-sm transition-all",
            isMobile && "py-3 text-base"
          )}
          placeholder={placeholder}
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (query.trim() || results.length > 0) && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {/* Database Sources */}
          {databases.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Searching in databases:
              </div>
              <div className="flex flex-wrap gap-2">
                {databases.map(db => (
                  <div
                    key={db.id}
                    className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    <div className={clsx(
                      "w-2 h-2 rounded-full mr-2",
                      db.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                    )} />
                    {db.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => navigateToResult(result)}
                  className={clsx(
                    "w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 border-transparent",
                    selectedIndex === index && "bg-gray-50 dark:bg-gray-700 border-indigo-500"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-xl mt-0.5">{getTypeIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </h4>
                        <span className={clsx(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize",
                          getStatusColor(result.metadata?.status || '', result.metadata?.priority)
                        )}>
                          {result.metadata?.status}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{result.type}</span>
                        {result.metadata?.client && result.type !== 'client' && (
                          <>
                            <span>•</span>
                            <span>{result.metadata.client}</span>
                          </>
                        )}
                        {result.metadata?.project && result.type === 'task' && (
                          <>
                            <span>•</span>
                            <span>{result.metadata.project}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-medium">{result.metadata?.databaseName}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() && !isLoading ? (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
