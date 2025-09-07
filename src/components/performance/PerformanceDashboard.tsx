'use client';

import React, { useState, useEffect, memo, useMemo } from 'react';
import { 
  performanceAnalytics, 
  fpsMonitor, 
  getMemoryUsage, 
  analyzeBundleSize,
  checkPerformanceBudget,
  useRenderTime
} from '@/lib/performance/analytics';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CpuChipIcon, 
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

const PerformanceDashboard = memo(function PerformanceDashboard({
  showAdvanced = false,
  className = ''
}: {
  showAdvanced?: boolean;
  className?: string;
}) {
  useRenderTime('PerformanceDashboard');
  
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [budgetCheck, setBudgetCheck] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Performance budget configuration
  const performanceBudget = useMemo(() => ({
    renderTime: 50, // ms
    bundleSize: 2, // MB
    memoryUsage: 100, // MB  
    fps: 55
  }), []);

  useEffect(() => {
    const updateMetrics = () => {
      const report = performanceAnalytics.generateReport();
      const memory = getMemoryUsage();
      const bundle = analyzeBundleSize();
      const currentFPS = fpsMonitor.getCurrentFPS();
      const budget = checkPerformanceBudget(performanceBudget);

      const newMetrics: PerformanceMetric[] = [
        {
          name: 'Average Render Time',
          value: report.averageRenderTime,
          unit: 'ms',
          status: report.averageRenderTime > 50 ? 'critical' : report.averageRenderTime > 25 ? 'warning' : 'good',
          description: 'Average time to render components'
        },
        {
          name: 'FPS',
          value: currentFPS,
          unit: 'fps',
          status: currentFPS < 30 ? 'critical' : currentFPS < 55 ? 'warning' : 'good',
          description: 'Frames per second'
        },
        {
          name: 'Memory Usage',
          value: memory?.used || 0,
          unit: 'MB',
          status: (memory?.used || 0) > 100 ? 'critical' : (memory?.used || 0) > 50 ? 'warning' : 'good',
          description: 'JavaScript heap memory usage'
        },
        {
          name: 'Bundle Load Time',
          value: bundle?.totalLoad || 0,
          unit: 'ms',
          status: (bundle?.totalLoad || 0) > 3000 ? 'critical' : (bundle?.totalLoad || 0) > 1500 ? 'warning' : 'good',
          description: 'Total time to load application bundle'
        }
      ];

      if (showAdvanced) {
        newMetrics.push(
          {
            name: 'Network Time',
            value: bundle?.networkTime || 0,
            unit: 'ms',
            status: (bundle?.networkTime || 0) > 1000 ? 'critical' : (bundle?.networkTime || 0) > 500 ? 'warning' : 'good',
            description: 'Time spent on network requests'
          },
          {
            name: 'Memory Limit',
            value: memory?.limit || 0,
            unit: 'MB',
            status: 'good',
            description: 'JavaScript heap memory limit'
          }
        );
      }

      setMetrics(newMetrics);
      setBudgetCheck(budget);
    };

    // Initial update
    updateMetrics();

    // Start FPS monitoring
    if (!isMonitoring) {
      fpsMonitor.start();
      setIsMonitoring(true);
    }

    // Update every 2 seconds
    const interval = setInterval(updateMetrics, 2000);

    return () => {
      clearInterval(interval);
      if (isMonitoring) {
        fpsMonitor.stop();
        setIsMonitoring(false);
      }
    };
  }, [showAdvanced, performanceBudget, isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ChartBarIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!showAdvanced && metrics.length === 0) {
    return null; // Don't render if no metrics and not in advanced mode
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BoltIcon className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Monitor
          </h3>
          {budgetCheck && (
            <span className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              budgetCheck.withinBudget 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            )}>
              {budgetCheck.withinBudget ? 'Within Budget' : 'Over Budget'}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="w-4 h-4" />
          <span>Live</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className={clsx(
        'grid gap-4',
        showAdvanced ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
      )}>
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className={clsx(
              'p-4 rounded-lg border transition-all duration-200 hover:shadow-sm',
              getStatusColor(metric.status)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(metric.status)}
                <span className="font-medium text-sm">{metric.name}</span>
              </div>
            </div>
            
            <div className="mb-2">
              <span className="text-2xl font-bold">
                {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
              </span>
              <span className="text-sm font-medium ml-1">{metric.unit}</span>
            </div>
            
            <p className="text-xs opacity-75">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Budget Violations */}
      {budgetCheck && budgetCheck.violations.length > 0 && showAdvanced && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <h4 className="font-medium text-red-800 dark:text-red-300">Performance Budget Violations</h4>
          </div>
          <ul className="space-y-1">
            {budgetCheck.violations.map((violation, index) => (
              <li key={index} className="text-sm text-red-700 dark:text-red-400">
                • {violation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Advanced Analytics */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Advanced Analytics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Metrics Collected:</span>
                <span className="font-medium">{performanceAnalytics.generateReport().totalMetrics}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cache Hit Rate:</span>
                <span className="font-medium">N/A</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Memory Usage:</span>
                <span className="font-medium">
                  {budgetCheck?.metrics.memoryUsage.toFixed(1)}MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bundle Size:</span>
                <span className="font-medium">
                  {(budgetCheck?.metrics.bundleSize / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PerformanceDashboard;
