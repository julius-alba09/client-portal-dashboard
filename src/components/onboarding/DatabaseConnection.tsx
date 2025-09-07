'use client';

import React, { useState, useEffect } from 'react';
import { 
  CircleStackIcon, 
  MagnifyingGlassIcon, 
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { OnboardingData } from '@/app/onboarding/page';

interface DatabaseConnectionProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface NotionDatabase {
  id: string;
  name: string;
  url: string;
  properties: Record<string, any>;
  type?: 'clients' | 'projects' | 'tasks';
  icon?: string;
}

// Mock Notion databases for demo
const mockNotionDatabases: NotionDatabase[] = [
  {
    id: 'db1',
    name: 'Client Directory',
    url: 'https://notion.so/client-directory-123',
    properties: { Name: 'title', Email: 'email', Company: 'rich_text', Status: 'select' },
    type: 'clients',
    icon: '👤'
  },
  {
    id: 'db2', 
    name: 'Customer Database',
    url: 'https://notion.so/customer-db-456',
    properties: { Name: 'title', Email: 'email', Company: 'rich_text' },
    type: 'clients',
    icon: '🏢'
  },
  {
    id: 'db3',
    name: 'Project Tracker',
    url: 'https://notion.so/projects-789',
    properties: { Name: 'title', Client: 'relation', Status: 'select', Priority: 'select' },
    type: 'projects',
    icon: '📁'
  },
  {
    id: 'db4',
    name: 'Client Projects',
    url: 'https://notion.so/client-projects-101',
    properties: { Title: 'title', Client: 'relation', Status: 'select' },
    type: 'projects',
    icon: '🗂️'
  },
  {
    id: 'db5',
    name: 'Task Management',
    url: 'https://notion.so/tasks-202',
    properties: { Name: 'title', Project: 'relation', Status: 'select', Assignee: 'people' },
    type: 'tasks',
    icon: '✅'
  },
  {
    id: 'db6',
    name: 'To-Do List',
    url: 'https://notion.so/todos-303',
    properties: { Task: 'title', Project: 'relation', Status: 'select' },
    type: 'tasks',
    icon: '📋'
  },
  {
    id: 'db7',
    name: 'Company Contacts',
    url: 'https://notion.so/contacts-404',
    properties: { Name: 'title', Email: 'email' },
    icon: '📇'
  },
  {
    id: 'db8',
    name: 'Meeting Notes',
    url: 'https://notion.so/meetings-505',
    properties: { Meeting: 'title', Date: 'date', Attendees: 'people' },
    icon: '📝'
  }
];

const databaseTypes = [
  {
    key: 'clients',
    name: 'Clients Database',
    description: 'Where you store your client information',
    icon: '👥',
    requiredFields: ['Name/Title', 'Email', 'Company'],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    key: 'projects', 
    name: 'Projects Database',
    description: 'Where you track client projects',
    icon: '📁',
    requiredFields: ['Name/Title', 'Client', 'Status'],
    color: 'from-green-500 to-emerald-600'
  },
  {
    key: 'tasks',
    name: 'Tasks Database', 
    description: 'Where you manage project tasks',
    icon: '✅',
    requiredFields: ['Name/Title', 'Project', 'Status'],
    color: 'from-purple-500 to-violet-600'
  }
] as const;

export default function DatabaseConnection({ data, onUpdate, onNext, onBack }: DatabaseConnectionProps) {
  const [currentDatabaseType, setCurrentDatabaseType] = useState<'clients' | 'projects' | 'tasks'>('clients');
  const [searchQueries, setSearchQueries] = useState({
    clients: '',
    projects: '',
    tasks: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentTypeConfig = databaseTypes.find(type => type.key === currentDatabaseType)!;
  const currentSearchQuery = searchQueries[currentDatabaseType];
  
  // Filter databases based on search and type
  const filteredDatabases = mockNotionDatabases.filter(db => {
    const matchesSearch = db.name.toLowerCase().includes(currentSearchQuery.toLowerCase());
    const matchesType = !db.type || db.type === currentDatabaseType;
    return matchesSearch && matchesType;
  });

  const selectedDatabase = data.databases[currentDatabaseType];
  
  const selectDatabase = (database: NotionDatabase) => {
    const updatedDatabases = {
      ...data.databases,
      [currentDatabaseType]: {
        id: database.id,
        name: database.name,
        url: database.url
      }
    };
    
    onUpdate({ databases: updatedDatabases });
  };

  const validateDatabaseProperties = (database: NotionDatabase) => {
    const currentType = databaseTypes.find(type => type.key === currentDatabaseType)!;
    const hasRequiredFields = currentType.requiredFields.some(field => 
      Object.keys(database.properties).some(prop => 
        prop.toLowerCase().includes(field.toLowerCase().split('/')[0])
      )
    );
    return hasRequiredFields;
  };

  const handleNext = () => {
    const missingDatabases = databaseTypes.filter(type => !data.databases[type.key]);
    
    if (missingDatabases.length > 0) {
      setErrors({ 
        databases: `Please connect all databases: ${missingDatabases.map(db => db.name).join(', ')}` 
      });
      return;
    }
    
    setErrors({});
    onNext();
  };

  const handleConnectToNotion = async () => {
    setIsConnecting(true);
    
    // Simulate OAuth flow
    try {
      // In a real implementation, this would:
      // 1. Initiate Notion OAuth flow
      // 2. Get user authorization
      // 3. Fetch available databases
      // 4. Return to this component with real data
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, just continue with mock data
      setIsConnecting(false);
    } catch (error) {
      console.error('Failed to connect to Notion:', error);
      setIsConnecting(false);
    }
  };

  const getCompletedSteps = () => {
    return databaseTypes.filter(type => data.databases[type.key]).length;
  };

  const isCurrentStepCompleted = () => {
    return !!data.databases[currentDatabaseType];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CircleStackIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect your Notion databases
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Link your Notion databases so ClientPortal can sync your data. We'll help you find the right databases.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Connected Databases
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getCompletedSteps()} of {databaseTypes.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(getCompletedSteps() / databaseTypes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Database Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {databaseTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setCurrentDatabaseType(type.key)}
              className={clsx(
                'p-6 rounded-xl border-2 transition-all text-left relative',
                currentDatabaseType === type.key
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              {data.databases[type.key] && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className="text-2xl mb-3">{type.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {type.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {type.description}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Required: {type.requiredFields.join(', ')}
              </div>
              
              {data.databases[type.key] && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-300">
                    ✓ {data.databases[type.key]!.name}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Database Search and Selection */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select your {currentTypeConfig.name}
            </h3>
            
            <button
              onClick={handleConnectToNotion}
              disabled={isConnecting}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isConnecting ? (
                <>
                  <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                'Connect to Notion'
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search for your ${currentTypeConfig.name.toLowerCase()}...`}
              value={currentSearchQuery}
              onChange={(e) => setSearchQueries(prev => ({ ...prev, [currentDatabaseType]: e.target.value }))}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Database Results */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredDatabases.length > 0 ? (
              filteredDatabases.map((database) => {
                const isSelected = selectedDatabase?.id === database.id;
                const isValidForType = validateDatabaseProperties(database);
                
                return (
                  <button
                    key={database.id}
                    onClick={() => selectDatabase(database)}
                    className={clsx(
                      'w-full p-4 rounded-lg border text-left transition-all',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{database.icon || '🗄️'}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {database.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {Object.keys(database.properties).length} properties
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!isValidForType && (
                          <div className="text-amber-500" title="Missing some recommended properties">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!isValidForType && (
                      <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        Missing recommended fields: {currentTypeConfig.requiredFields.join(', ')}
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CircleStackIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No databases found matching "{currentSearchQuery}"</p>
                <button
                  onClick={handleConnectToNotion}
                  className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Connect to Notion to see your databases
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>

          {errors.databases && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {errors.databases}
            </div>
          )}

          <button
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Complete Setup
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
