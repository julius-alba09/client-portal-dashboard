import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/notion-oauth';
import { cookies } from 'next/headers';

interface DatabaseConfiguration {
  clientsDatabase: string;
  projectsDatabase: string;
  tasksDatabase: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('notion_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not connected to Notion' },
        { status: 401 }
      );
    }

    const config: DatabaseConfiguration = await request.json();
    const { clientsDatabase, projectsDatabase, tasksDatabase } = config;

    // Validate all database IDs are provided
    if (!clientsDatabase || !projectsDatabase || !tasksDatabase) {
      return NextResponse.json(
        { error: 'All database IDs are required' },
        { status: 400 }
      );
    }

    // Test connections to all databases
    const tests = await Promise.allSettled([
      testDatabaseConnection(accessToken, clientsDatabase, 'clients'),
      testDatabaseConnection(accessToken, projectsDatabase, 'projects'),
      testDatabaseConnection(accessToken, tasksDatabase, 'tasks'),
    ]);

    const results = {
      clients: tests[0].status === 'fulfilled' ? tests[0].value : { success: false, error: 'Connection failed' },
      projects: tests[1].status === 'fulfilled' ? tests[1].value : { success: false, error: 'Connection failed' },
      tasks: tests[2].status === 'fulfilled' ? tests[2].value : { success: false, error: 'Connection failed' },
    };

    // Check if all connections are successful
    const allSuccessful = results.clients.success && results.projects.success && results.tasks.success;

    if (allSuccessful) {
      // Save configuration to cookies (in production, save to database)
      const response = NextResponse.json({
        success: true,
        message: 'Database configuration saved successfully',
        results,
      });

      response.cookies.set('notion_database_config', JSON.stringify({
        clientsDatabase,
        projectsDatabase,
        tasksDatabase,
        configured_at: new Date().toISOString(),
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json({
        success: false,
        message: 'Some database connections failed',
        results,
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error configuring databases:', error);
    return NextResponse.json(
      { error: 'Failed to configure databases' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const configCookie = cookieStore.get('notion_database_config')?.value;
    const workspaceInfoCookie = cookieStore.get('notion_workspace_info')?.value;

    if (!configCookie) {
      return NextResponse.json({
        success: true,
        data: {
          configured: false,
          configuration: null,
          workspace: workspaceInfoCookie ? JSON.parse(workspaceInfoCookie) : null,
        },
      });
    }

    const configuration = JSON.parse(configCookie);
    const workspaceInfo = workspaceInfoCookie ? JSON.parse(workspaceInfoCookie) : null;

    return NextResponse.json({
      success: true,
      data: {
        configured: true,
        configuration,
        workspace: workspaceInfo,
      },
    });

  } catch (error) {
    console.error('Error getting database configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get database configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear all Notion-related cookies
    const response = NextResponse.json({
      success: true,
      message: 'Notion integration disconnected',
    });

    response.cookies.delete('notion_access_token');
    response.cookies.delete('notion_workspace_info');
    response.cookies.delete('notion_database_config');

    return response;

  } catch (error) {
    console.error('Error disconnecting from Notion:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect from Notion' },
      { status: 500 }
    );
  }
}
