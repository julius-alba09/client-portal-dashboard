'use client';

import React, { 
  lazy, 
  Suspense, 
  memo, 
  useMemo, 
  useCallback,
  useRef,
  useEffect,
  useState
} from 'react';

// LRU Cache implementation for ultra-fast data caching
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instances
export const componentCache = new LRUCache<string, any>(50);
export const dataCache = new LRUCache<string, any>(200);

/**
 * Hook for memoized data with LRU cache
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => T | Promise<T>,
  dependencies: any[] = []
): T | undefined {
  const [data, setData] = useState<T | undefined>(dataCache.get(key));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetcher();
        dataCache.set(key, result);
        setData(result);
      } catch (error) {
        console.error('Error fetching cached data:', error);
      }
    };

    if (!dataCache.get(key)) {
      fetchData();
    }
  }, [key, ...dependencies]);

  return data;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isVisible;
}

/**
 * Lazy loading wrapper component
 */
export const LazyWrapper = memo(function LazyWrapper({
  children,
  fallback = <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-20" />,
  threshold = 0.1,
  rootMargin = '50px'
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold, rootMargin });
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (isVisible && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [isVisible, hasBeenVisible]);

  return (
    <div ref={ref}>
      {hasBeenVisible ? children : fallback}
    </div>
  );
});

/**
 * Image lazy loading component with progressive enhancement
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  placeholder,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholder?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const isVisible = useIntersectionObserver(imgRef);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setIsError(true);
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className || ''}`}>
      {isVisible && (
        <>
          {!isLoaded && !isError && (
            <div 
              className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
              style={{ backgroundColor: placeholder }}
            />
          )}
          <img
            src={src}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className || ''}`}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
          {isError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm">
              Failed to load image
            </div>
          )}
        </>
      )}
    </div>
  );
});

/**
 * Code splitting utility for lazy component loading
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(importFunc);
  
  return memo((props: React.ComponentProps<T>) => (
    <Suspense 
      fallback={
        fallback ? (
          React.createElement(fallback, props)
        ) : (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-32" />
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  ));
}

/**
 * Debounced value hook for performance optimization
 */
export function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled callback hook for performance optimization
 */
export function useThrottled<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}
