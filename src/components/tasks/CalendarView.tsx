'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  isSameMonth
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface CalendarViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

const priorityColors = {
  low: 'bg-gray-400',
  medium: 'bg-blue-400',
  high: 'bg-orange-400',
  urgent: 'bg-red-500'
};

export default function CalendarView({ tasks, onTaskUpdate, onTaskDelete }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.due_date && isSameDay(task.due_date, date)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const TaskDot = ({ task }: { task: Task }) => (
    <div
      className={clsx(
        'w-2 h-2 rounded-full mb-1',
        priorityColors[task.priority]
      )}
      title={`${task.title} - ${task.priority} priority`}
    />
  );

  const TaskPopover = ({ tasks, date }: { tasks: Task[], date: Date }) => {
    if (tasks.length === 0) return null;

    return (
      <div className="absolute z-10 top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {format(date, 'MMMM d, yyyy')}
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className={clsx('w-2 h-2 rounded-full mt-1.5', priorityColors[task.priority])} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {task.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {task.assignee || 'Unassigned'}
                </div>
                {task.status !== 'done' && task.due_date && task.due_date < new Date() && (
                  <div className="text-xs text-red-600 dark:text-red-400">Overdue</div>
                )}
              </div>
              <button
                onClick={() => onTaskDelete(task.id)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-6">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px">
          {days.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={clsx(
                  'relative min-h-[100px] p-2 border border-gray-100 dark:border-gray-700',
                  isCurrentMonth 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-gray-50 dark:bg-gray-900',
                  isDayToday && 'bg-blue-50 dark:bg-blue-900'
                )}
              >
                <div className={clsx(
                  'text-sm font-medium mb-1',
                  isCurrentMonth 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-600',
                  isDayToday && 'text-blue-600 dark:text-blue-400'
                )}>
                  {format(day, 'd')}
                </div>

                {/* Task dots */}
                <div className="flex flex-wrap gap-1">
                  {dayTasks.slice(0, 6).map((task) => (
                    <TaskDot key={task.id} task={task} />
                  ))}
                  {dayTasks.length > 6 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayTasks.length - 6}
                    </div>
                  )}
                </div>

                {/* Hover popover */}
                {dayTasks.length > 0 && (
                  <div className="group">
                    <div className="absolute inset-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer" />
                    <div className="hidden group-hover:block">
                      <TaskPopover tasks={dayTasks} date={day} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">Priority:</span>
          {Object.entries(priorityColors).map(([priority, colorClass]) => (
            <div key={priority} className="flex items-center space-x-1">
              <div className={clsx('w-2 h-2 rounded-full', colorClass)} />
              <span className="capitalize">{priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
