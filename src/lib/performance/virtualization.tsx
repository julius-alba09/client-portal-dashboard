'use client';

import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  useRef, 
  memo 
} from 'react';

interface VirtualScrollerProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * Ultra-fast virtual scroller component for handling large lists
 * Renders only visible items for optimal performance
 */
export const VirtualScroller = memo(function VirtualScroller<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualScrollerProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate which items are visible
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIdx = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return {
      startIndex: startIdx,
      endIndex: endIdx,
      visibleItems: items.slice(startIdx, endIdx)
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Total height of all items
  const totalHeight = items.length * itemHeight;
  
  // Offset for visible items
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * Hook for optimized list operations with virtual scrolling
 */
export function useVirtualList<T>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  }
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const { itemHeight, containerHeight, overscan = 5 } = options;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, options]);

  const handleScroll = useCallback((scrollTop: number) => {
    setScrollTop(scrollTop);
  }, []);

  return {
    ...visibleRange,
    handleScroll
  };
}

/**
 * Memoized table row for virtual table rendering
 */
export const VirtualTableRow = memo(function VirtualTableRow({
  children,
  height,
  className
}: {
  children: React.ReactNode;
  height: number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center border-b border-gray-200 dark:border-gray-700 ${className || ''}`}
      style={{ height, minHeight: height }}
    >
      {children}
    </div>
  );
});
