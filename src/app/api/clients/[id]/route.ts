import { NextRequest, NextResponse } from 'next/server';
import { getClientById, getProjectsByClientId, getTasksByClientId } from '@/lib/dummy-data';
import { fetchNotionClient, fetchNotionProjectsByClient, fetchNotionTasksByClient } from '@/lib/notion-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;

    // Try to fetch from Notion first, fallback to dummy data
    let client, projects, tasks;

    try {
      // Check if user has Notion configured
      client = await fetchNotionClient(clientId);
      if (client) {
        projects = await fetchNotionProjectsByClient(clientId);
        tasks = await fetchNotionTasksByClient(clientId);
      }
    } catch (notionError) {
      console.warn('Notion integration not available, using dummy data:', notionError);
    }

    // Fallback to dummy data if Notion is not configured or fails
    if (!client) {
      client = getClientById(clientId);
      projects = getProjectsByClientId(clientId);
      tasks = getTasksByClientId(clientId);
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        client,
        projects,
        tasks,
      },
    });
  } catch (error) {
    console.error('Error fetching client data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
