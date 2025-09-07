'use client';

import React, { useMemo, useCallback, memo } from 'react';
import { Task, KanbanColumn } from '@/types';
import { format } from 'date-fns';
import { CalendarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface KanbanViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

// Memoized constants to prevent recreation on every render
const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', tasks: [], color: 'bg-gray-100 dark:bg-gray-700' },
  { id: 'in_progress', title: 'In Progress', tasks: [], color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'review', title: 'Review', tasks: [], color: 'bg-yellow-100 dark:bg-yellow-900' },
  { id: 'done', title: 'Done', tasks: [], color: 'bg-green-100 dark:bg-green-900' },
  { id: 'blocked', title: 'Blocked', tasks: [], color: 'bg-red-100 dark:bg-red-900' },
] as const;

const priorityColors = {
  low: 'border-l-gray-300',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500'
} as const;

const KanbanView = memo(function KanbanView({ tasks, onTaskUpdate, onTaskDelete }: KanbanViewProps) {
  // Memoized task filtering by status
  const getTasksByStatus = useCallback((status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onTaskUpdate(taskId, { status: newStatus });
  }, [onTaskUpdate]);

  // Memoized TaskCard component to prevent unnecessary re-renders
  const TaskCard = memo(({ task }: { task: Task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 mb-3 cursor-move hover:shadow-md transition-shadow',
        'border-l-4',
        priorityColors[task.priority]
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
          {task.title}
        </h4>
        <button
          onClick={() => onTaskDelete(task.id)}
          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task details */}
      <div className="space-y-2 mb-3">
        {task.due_date && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-3 h-3 mr-1" />
            <span className={clsx(
              task.due_date < new Date() && task.status !== 'done'
                ? 'text-red-600 dark:text-red-400'
                : ''
            )}>
              {format(task.due_date, 'MMM d')}
            </span>
          </div>
        )}

        {task.assignee && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <UserIcon className="w-3 h-3 mr-1" />
            <span>{task.assignee}</span>
          </div>
        )}

        {task.estimated_hours && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>{task.estimated_hours}h estimated</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Priority indicator */}
      <div className="flex justify-between items-center">
        <span className={clsx(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
          task.priority === 'low' && 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
          task.priority === 'medium' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
          task.priority === 'high' && 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
          task.priority === 'urgent' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        )}>
          {task.priority}
        </span>

        {/* Progress indicator if available */}
        {task.actual_hours && task.estimated_hours && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round((task.actual_hours / task.estimated_hours) * 100)}%
          </div>
        )}
      </div>
    </div>
  ));

  // Memoized columns with their tasks to prevent unnecessary re-filtering
  const columnsWithTasks = useMemo(() => {
    return columns.map(column => ({
      ...column,
      columnTasks: getTasksByStatus(column.id)
    }));
  }, [getTasksByStatus]);

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {columnsWithTasks.map(({ id, title, color, columnTasks }) => (
        <div key={id} className="flex-shrink-0 w-80">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Column header */}
            <div className={clsx('px-4 py-3 rounded-t-lg', color)}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {title}
                </h3>
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Column content */}
            <div
              className="p-4 min-h-[500px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, id)}
            >
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No {title.toLowerCase()} tasks
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default KanbanView;
