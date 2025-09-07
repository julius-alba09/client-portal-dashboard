'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';
import { AuthGuard } from '@/contexts/AuthContext';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface DatabaseInfo {
  id: string;
  title: string;
  description: string;
  icon?: {
    type: string;
    emoji?: string;
  };
  properties: string[];
  validation: {
    clients: { valid: boolean; missingProperties: string[]; suggestions?: string[] };
    projects: { valid: boolean; missingProperties: string[]; suggestions?: string[] };
    tasks: { valid: boolean; missingProperties: string[]; suggestions?: string[] };
  };
}

interface WorkspaceInfo {
  workspace_name: string;
  workspace_id: string;
  workspace_icon?: string;
  databases_count: number;
  connected_at: string;
}

interface DatabaseConfiguration {
  clientsDatabase: string;
  projectsDatabase: string;
  tasksDatabase: string;
  configured_at: string;
}

function SettingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | null>(null);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [configuration, setConfiguration] = useState<DatabaseConfiguration | null>(null);
  const [selectedDatabases, setSelectedDatabases] = useState({
    clients: '',
    projects: '',
    tasks: '',
  });
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check connection status and load configuration
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Handle URL parameters (OAuth callback results)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const errorParam = urlParams.get('error');

    if (connected === 'true') {
      setSuccess('Successfully connected to Notion!');
      checkConnectionStatus();
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }

    if (errorParam) {
      const errorMessages: { [key: string]: string } = {
        oauth_error: 'OAuth authorization failed',
        missing_code: 'Authorization code missing',
        expired_state: 'Authorization session expired',
        invalid_state: 'Invalid authorization state',
        token_exchange_failed: 'Failed to exchange authorization code',
        callback_error: 'Authorization callback error',
      };
      setError(errorMessages[errorParam] || 'Authorization failed');
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/notion/databases/configure');
      const data = await response.json();

      if (data.success) {
        setIsConnected(data.data.configured || !!data.data.workspace);
        setWorkspaceInfo(data.data.workspace);
        setConfiguration(data.data.configuration);

        if (data.data.configuration) {
          setSelectedDatabases({
            clients: data.data.configuration.clientsDatabase,
            projects: data.data.configuration.projectsDatabase,
            tasks: data.data.configuration.tasksDatabase,
          });
        }
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToNotion = () => {
    window.location.href = '/api/auth/notion/authorize';
  };

  const loadDatabases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notion/databases');
      const data = await response.json();

      if (data.success) {
        setDatabases(data.data);
      } else {
        setError('Failed to load databases');
      }
    } catch (error) {
      setError('Failed to load databases from Notion');
    } finally {
      setLoading(false);
    }
  };

  const saveDatabaseConfiguration = async () => {
    if (!selectedDatabases.clients || !selectedDatabases.projects || !selectedDatabases.tasks) {
      setError('Please select all three databases');
      return;
    }

    try {
      setConfiguring(true);
      setError(null);

      const response = await fetch('/api/notion/databases/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientsDatabase: selectedDatabases.clients,
          projectsDatabase: selectedDatabases.projects,
          tasksDatabase: selectedDatabases.tasks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Database configuration saved successfully!');
        checkConnectionStatus();
      } else {
        setError(data.message || 'Failed to save configuration');
      }
    } catch (error) {
      setError('Failed to save database configuration');
    } finally {
      setConfiguring(false);
    }
  };

  const disconnectNotion = async () => {
    try {
      const response = await fetch('/api/notion/databases/configure', {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsConnected(false);
        setWorkspaceInfo(null);
        setConfiguration(null);
        setDatabases([]);
        setSelectedDatabases({ clients: '', projects: '', tasks: '' });
        setSuccess('Successfully disconnected from Notion');
      } else {
        setError('Failed to disconnect from Notion');
      }
    } catch (error) {
      setError('Failed to disconnect from Notion');
    }
  };

  // Load databases when connected but not configured
  useEffect(() => {
    if (isConnected && !configuration && databases.length === 0) {
      loadDatabases();
    }
  }, [isConnected, configuration, databases.length]);

  const getDatabaseRecommendation = (type: 'clients' | 'projects' | 'tasks'): DatabaseInfo | undefined => {
    return databases.find(db => db.validation[type].valid);
  };

  const DatabaseCard = ({ database, type, selected, onSelect }: {
    database: DatabaseInfo;
    type: 'clients' | 'projects' | 'tasks';
    selected: boolean;
    onSelect: () => void;
  }) => {
    const validation = database.validation[type];
    const isRecommended = validation.valid;

    return (
      <div
        onClick={onSelect}
        className={clsx(
          'border rounded-lg p-4 cursor-pointer transition-all',
          selected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
          isRecommended && !selected && 'border-green-300 bg-green-50 dark:bg-green-900/20'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {database.icon?.emoji && (
                <span className="text-lg">{database.icon.emoji}</span>
              )}
              <h4 className="font-medium text-gray-900 dark:text-white">
                {database.title}
              </h4>
              {isRecommended && (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              )}
            </div>
            {database.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {database.description}
              </p>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Properties: {database.properties.join(', ')}
            </div>
            {!validation.valid && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                Missing: {validation.missingProperties.join(', ')}
              </div>
            )}
            {validation.suggestions && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {validation.suggestions.join(', ')}
              </div>
            )}
          </div>
          <div className="ml-4">
            <input
              type="radio"
              checked={selected}
              onChange={onSelect}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading settings...</p>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your integrations and preferences
            </p>
          </div>

          {/* Performance Dashboard */}
          <PerformanceDashboard showAdvanced={true} />

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3" />
                <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
                <div className="text-sm text-green-700 dark:text-green-400">{success}</div>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-green-400 hover:text-green-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Notion Integration Card */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <img
                      src="https://www.notion.so/images/logo-ios.png"
                      alt="Notion"
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notion Integration
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Connect your Notion workspace to sync data
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Not Connected
                    </span>
                  )}
                </div>
              </div>

              {!isConnected ? (
                /* Not Connected State */
                <div className="text-center py-8">
                  <CircleStackIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Connect to Notion
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Connect your Notion workspace to automatically sync your clients, projects, and tasks data.
                  </p>
                  <button
                    onClick={connectToNotion}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <LinkIcon className="w-5 h-5 mr-2" />
                    Connect to Notion
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ) : !configuration ? (
                /* Connected but Not Configured */
                <div>
                  {workspaceInfo && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {workspaceInfo.workspace_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {workspaceInfo.workspace_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {workspaceInfo.databases_count} databases available
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Select Your Databases
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Choose which databases to use for clients, projects, and tasks. 
                        Databases with ✓ meet the recommended structure.
                      </p>
                    </div>

                    {/* Clients Database */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Clients Database
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="space-y-2">
                        {databases.map((db) => (
                          <DatabaseCard
                            key={`clients-${db.id}`}
                            database={db}
                            type="clients"
                            selected={selectedDatabases.clients === db.id}
                            onSelect={() => setSelectedDatabases(prev => ({ ...prev, clients: db.id }))}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Projects Database */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Projects Database
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="space-y-2">
                        {databases.map((db) => (
                          <DatabaseCard
                            key={`projects-${db.id}`}
                            database={db}
                            type="projects"
                            selected={selectedDatabases.projects === db.id}
                            onSelect={() => setSelectedDatabases(prev => ({ ...prev, projects: db.id }))}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Tasks Database */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tasks Database
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="space-y-2">
                        {databases.map((db) => (
                          <DatabaseCard
                            key={`tasks-${db.id}`}
                            database={db}
                            type="tasks"
                            selected={selectedDatabases.tasks === db.id}
                            onSelect={() => setSelectedDatabases(prev => ({ ...prev, tasks: db.id }))}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between pt-4">
                      <button
                        onClick={disconnectNotion}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        Disconnect
                      </button>
                      <button
                        onClick={saveDatabaseConfiguration}
                        disabled={configuring || !selectedDatabases.clients || !selectedDatabases.projects || !selectedDatabases.tasks}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {configuring ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Configuring...
                          </>
                        ) : (
                          <>
                            <Cog6ToothIcon className="w-4 h-4 mr-2" />
                            Save Configuration
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fully Configured */
                <div>
                  {workspaceInfo && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircleIcon className="w-8 h-8 text-green-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              Integration Active
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Connected to {workspaceInfo.workspace_name}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={disconnectNotion}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Clients Database
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {configuration.clientsDatabase.slice(0, 8)}...
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Projects Database
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {configuration.projectsDatabase.slice(0, 8)}...
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Tasks Database
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {configuration.tasksDatabase.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}

export default SettingsPage;
