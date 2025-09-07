'use client';

// Performance metrics tracking
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'render' | 'data' | 'user-interaction' | 'network';
  metadata?: Record<string, any>;
}

class PerformanceAnalytics {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Web Vitals observer
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
              category: 'render',
              metadata: { entryType: entry.entryType }
            });
          }
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        this.observers.set('vitals', observer);
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log performance issues
    if (metric.category === 'render' && metric.value > 100) {
      console.warn(`Slow render detected: ${metric.name} took ${metric.value}ms`);
    }
  }

  getMetrics(category?: string): PerformanceMetric[] {
    return category 
      ? this.metrics.filter(m => m.category === category)
      : this.metrics;
  }

  getAverageMetric(name: string): number {
    const relevant = this.metrics.filter(m => m.name === name);
    if (relevant.length === 0) return 0;
    
    const sum = relevant.reduce((acc, m) => acc + m.value, 0);
    return sum / relevant.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  generateReport(): {
    totalMetrics: number;
    averageRenderTime: number;
    slowestRender: PerformanceMetric | null;
    recentMetrics: PerformanceMetric[];
  } {
    const renderMetrics = this.getMetrics('render');
    const recent = this.metrics.slice(-10);
    
    return {
      totalMetrics: this.metrics.length,
      averageRenderTime: this.getAverageMetric('component-render'),
      slowestRender: renderMetrics.reduce((slowest, current) => 
        !slowest || current.value > slowest.value ? current : slowest, 
        null as PerformanceMetric | null
      ),
      recentMetrics: recent
    };
  }

  dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics = [];
  }
}

// Global performance analytics instance
export const performanceAnalytics = new PerformanceAnalytics();

// React hooks for performance monitoring
import { useEffect, useRef } from 'react';

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string) {
  const startTime = useRef<number>();
  
  // Measure start time
  startTime.current = performance.now();
  
  useEffect(() => {
    if (startTime.current) {
      const renderTime = performance.now() - startTime.current;
      performanceAnalytics.recordMetric({
        name: `${componentName}-render`,
        value: renderTime,
        timestamp: Date.now(),
        category: 'render',
        metadata: { component: componentName }
      });
    }
  });
}

/**
 * Hook to measure data fetching performance
 */
export function useDataFetchTime(operationName: string) {
  const measureFetch = (fetchFn: () => Promise<any>) => {
    const startTime = performance.now();
    
    return fetchFn().finally(() => {
      const fetchTime = performance.now() - startTime;
      performanceAnalytics.recordMetric({
        name: `${operationName}-fetch`,
        value: fetchTime,
        timestamp: Date.now(),
        category: 'data',
        metadata: { operation: operationName }
      });
    });
  };

  return measureFetch;
}

/**
 * Hook to measure user interaction response time
 */
export function useInteractionTime(interactionName: string) {
  const measureInteraction = (interactionFn: () => void | Promise<void>) => {
    const startTime = performance.now();
    
    const result = interactionFn();
    
    const handleComplete = () => {
      const interactionTime = performance.now() - startTime;
      performanceAnalytics.recordMetric({
        name: `${interactionName}-interaction`,
        value: interactionTime,
        timestamp: Date.now(),
        category: 'user-interaction',
        metadata: { interaction: interactionName }
      });
    };

    if (result instanceof Promise) {
      result.finally(handleComplete);
    } else {
      handleComplete();
    }

    return result;
  };

  return measureInteraction;
}

/**
 * Bundle size analyzer utility
 */
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;

  return {
    loadStart: navigation.loadEventStart,
    loadEnd: navigation.loadEventEnd,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    totalLoad: navigation.loadEventEnd - navigation.navigationStart,
    networkTime: navigation.responseEnd - navigation.requestStart,
    renderTime: navigation.loadEventEnd - navigation.responseEnd
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100, // MB
    total: Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100, // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100, // MB
    usage: Math.round(memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100) // %
  };
}

/**
 * FPS monitoring utility
 */
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private running = false;

  start() {
    if (this.running) return;
    this.running = true;
    this.measure();
  }

  stop() {
    this.running = false;
  }

  private measure = () => {
    if (!this.running) return;

    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Record FPS metric
      performanceAnalytics.recordMetric({
        name: 'fps',
        value: this.fps,
        timestamp: Date.now(),
        category: 'render',
        metadata: { type: 'fps' }
      });
    }

    requestAnimationFrame(this.measure);
  };

  getCurrentFPS(): number {
    return this.fps;
  }
}

// Global FPS monitor instance
export const fpsMonitor = new FPSMonitor();

/**
 * Performance budget checker
 */
export function checkPerformanceBudget(budgets: {
  renderTime?: number; // ms
  bundleSize?: number; // MB
  memoryUsage?: number; // MB
  fps?: number;
}) {
  const report = performanceAnalytics.generateReport();
  const memory = getMemoryUsage();
  const bundle = analyzeBundleSize();
  const currentFPS = fpsMonitor.getCurrentFPS();

  const violations: string[] = [];

  if (budgets.renderTime && report.averageRenderTime > budgets.renderTime) {
    violations.push(`Render time (${report.averageRenderTime.toFixed(2)}ms) exceeds budget (${budgets.renderTime}ms)`);
  }

  if (budgets.memoryUsage && memory && memory.used > budgets.memoryUsage) {
    violations.push(`Memory usage (${memory.used}MB) exceeds budget (${budgets.memoryUsage}MB)`);
  }

  if (budgets.fps && currentFPS < budgets.fps) {
    violations.push(`FPS (${currentFPS}) below budget (${budgets.fps})`);
  }

  return {
    withinBudget: violations.length === 0,
    violations,
    metrics: {
      averageRenderTime: report.averageRenderTime,
      memoryUsage: memory?.used || 0,
      fps: currentFPS,
      bundleSize: bundle?.totalLoad || 0
    }
  };
}
