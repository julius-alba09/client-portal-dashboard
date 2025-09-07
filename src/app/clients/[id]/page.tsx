'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import TableView from '@/components/tasks/TableView';
import KanbanView from '@/components/tasks/KanbanView';
import CalendarView from '@/components/tasks/CalendarView';
import DatabaseBreadcrumb, { createBreadcrumbWithDatabase, defaultDatabaseSources } from '@/components/navigation/DatabaseBreadcrumb';
import { AuthGuard, useAuth } from '@/contexts/AuthContext';
import { 
  getClientById, 
  getProjectsByClientId, 
  getTasksByClientId 
} from '@/lib/dummy-data';
import { Task, ViewType } from '@/types';
import { 
  TableCellsIcon, 
  RectangleStackIcon, 
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const viewTypes: { type: ViewType; label: string; icon: React.ComponentType<any> }[] = [
  { type: 'table', label: 'Table', icon: TableCellsIcon },
  { type: 'kanban', label: 'Kanban', icon: RectangleStackIcon },
  { type: 'calendar', label: 'Calendar', icon: CalendarIcon },
];

function ClientDashboardPage() {
  const params = useParams();
  const { user } = useAuth();
  const clientId = params.id as string;
  
  const [currentView, setCurrentView] = useState<ViewType>('table');
  const [tasks, setTasks] = useState(() => getTasksByClientId(clientId));

  const client = getClientById(clientId);
  const projects = getProjectsByClientId(clientId);

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Client not found</div>
        </div>
      </Layout>
    );
  }

  // Check if user has access to this client's data
  if (user?.role === 'client' && user.client_id !== clientId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400">Access denied</div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            You don't have permission to view this client's dashboard.
          </p>
        </div>
      </Layout>
    );
  }

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Calculate dashboard stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const overdueTasks = tasks.filter(task => 
    task.due_date && task.due_date < new Date() && task.status !== 'done'
  ).length;

  const stats = [
    { name: 'Total Tasks', value: totalTasks, color: 'text-blue-600' },
    { name: 'Completed', value: completedTasks, color: 'text-green-600' },
    { name: 'In Progress', value: inProgressTasks, color: 'text-yellow-600' },
    { name: 'Overdue', value: overdueTasks, color: 'text-red-600' },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'table':
        return (
          <TableView 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        );
      case 'kanban':
        return (
          <KanbanView 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        );
      default:
        return null;
    }
  };

  // Create breadcrumbs with database information
  const breadcrumbItems = createBreadcrumbWithDatabase([
    { label: 'Dashboard', href: '/' },
    { label: 'Clients', href: '/clients' },
    { label: client.name, current: true }
  ], defaultDatabaseSources);

  return (
    <Layout client={client}>
      <div className="space-y-8">
        {/* Breadcrumbs with Database Info */}
        <DatabaseBreadcrumb items={breadcrumbItems} />
        
        {/* Database Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CircleStackIcon className="w-5 h-5 mr-2" />
              Connected Databases
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last synced: Just now
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultDatabaseSources.map(db => (
              <div key={db.id} className="flex items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{db.source === 'notion' ? '🗃️' : '📋'}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {db.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {db.type} • {db.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {client.name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {client.company} • {projects.length} projects • {totalTasks} tasks
            </p>
          </div>
          <div className="mt-6 sm:mt-0 flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Reports
            </button>
            <button className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col">
                <div className={clsx('text-3xl font-bold mb-2', stat.color)}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Projects</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {project.name}
                    </h4>
                    <span className={clsx(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize shrink-0 ml-2',
                      project.status === 'in_progress' && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
                      project.status === 'not_started' && 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                      project.status === 'completed' && 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
                      project.status === 'on_hold' && 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                    )}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {tasks.filter(task => task.project_id === project.id).length} tasks
                    </span>
                    {project.due_date && (
                      <span className="text-gray-500 dark:text-gray-400">
                        Due {new Date(project.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Views */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
          {/* View selector */}
          <div className="border-b border-gray-100 dark:border-gray-800">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h3>
                <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-1">
                  {viewTypes.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setCurrentView(type)}
                      className={clsx(
                        'flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        currentView === type
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current view */}
          <div className="p-6">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ClientDashboard() {
  return (
    <AuthGuard>
      <ClientDashboardPage />
    </AuthGuard>
  );
}
