import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/types';
import { updateNotionTask } from '@/lib/notion-data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const updates: Partial<Task> = await request.json();

    let success = false;
    let message = 'Task update simulated (Notion not configured)';

    try {
      // Try to update in Notion if configured
      success = await updateNotionTask(taskId, updates);
      if (success) {
        message = 'Task updated in Notion successfully';
      }
    } catch (notionError) {
      console.warn('Notion update failed, using simulation:', notionError);
    }

    return NextResponse.json({
      success: true,
      message,
      data: { id: taskId, ...updates },
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // For demo purposes, we'll simulate deletion
    // In a real app with Notion, you'd either delete the page or move it to a "deleted" status
    return NextResponse.json({
      success: true,
      message: 'Task deleted (simulated)',
      data: { id: taskId },
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
