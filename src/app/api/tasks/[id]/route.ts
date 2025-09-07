import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/types';
import { updateNotionTask } from '@/lib/notion-data';
import { dataCache } from '@/lib/performance/lazy-loading';

// Enable edge runtime for ultra-fast cold starts
export const runtime = 'edge';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = performance.now();
  
  try {
    const { id: taskId } = await params;
    const updates: Partial<Task> = await request.json();

    let success = false;
    let message = 'Task update simulated (Notion not configured)';
    let dataSource = 'dummy';

    try {
      // Try to update in Notion if configured
      success = await updateNotionTask(taskId, updates);
      if (success) {
        message = 'Task updated in Notion successfully';
        dataSource = 'notion';
      }
    } catch (notionError) {
      console.warn('Notion update failed, using simulation:', notionError);
    }

    // Invalidate related caches for real-time updates
    const cacheKeysToInvalidate = [
      `task-${taskId}`,
      'client-data-', // This will be a partial match
    ];
    
    // Clear cache entries that might contain this task
    for (const key of dataCache['cache'].keys()) {
      for (const pattern of cacheKeysToInvalidate) {
        if (key.includes(pattern)) {
          dataCache['cache'].delete(key);
        }
      }
    }

    const responseTime = performance.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        message,
        data: { id: taskId, ...updates },
        responseTime: Math.round(responseTime * 100) / 100
      },
      {
        headers: {
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Data-Source': dataSource,
          'X-Cache-Invalidated': 'true'
        }
      }
    );
  } catch (error) {
    console.error('Error updating task:', error);
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json(
      { 
        error: 'Failed to update task',
        responseTime: Math.round(responseTime * 100) / 100
      },
      { 
        status: 500,
        headers: {
          'X-Response-Time': `${Math.round(responseTime)}ms`
        }
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = performance.now();
  
  try {
    const { id: taskId } = await params;

    // Invalidate caches before deletion for real-time updates
    for (const key of dataCache['cache'].keys()) {
      if (key.includes(`task-${taskId}`) || key.includes('client-data-')) {
        dataCache['cache'].delete(key);
      }
    }

    const responseTime = performance.now() - startTime;

    // For demo purposes, we'll simulate deletion
    // In a real app with Notion, you'd either delete the page or move it to a "deleted" status
    return NextResponse.json(
      {
        success: true,
        message: 'Task deleted (simulated)',
        data: { id: taskId },
        responseTime: Math.round(responseTime * 100) / 100
      },
      {
        headers: {
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Cache-Invalidated': 'true'
        }
      }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json(
      { 
        error: 'Failed to delete task',
        responseTime: Math.round(responseTime * 100) / 100
      },
      { 
        status: 500,
        headers: {
          'X-Response-Time': `${Math.round(responseTime)}ms`
        }
      }
    );
  }
}
