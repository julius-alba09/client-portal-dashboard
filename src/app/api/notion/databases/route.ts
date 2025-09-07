import { NextRequest, NextResponse } from 'next/server';
import { fetchUserDatabases, getDatabaseTitle, getDatabaseDescription, validateDatabaseStructure } from '@/lib/notion-oauth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('notion_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not connected to Notion' },
        { status: 401 }
      );
    }

    // Fetch databases from Notion
    const databases = await fetchUserDatabases(accessToken);

    // Transform databases to include helpful information
    const transformedDatabases = databases.map(db => ({
      id: db.id,
      title: getDatabaseTitle(db),
      description: getDatabaseDescription(db),
      icon: db.icon,
      cover: db.cover,
      properties: Object.keys(db.properties),
      parent: db.parent,
      created_time: db.created_time,
      last_edited_time: db.last_edited_time,
      // Add validation for different types
      validation: {
        clients: validateDatabaseStructure(db, 'clients'),
        projects: validateDatabaseStructure(db, 'projects'),
        tasks: validateDatabaseStructure(db, 'tasks'),
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedDatabases,
    });

  } catch (error) {
    console.error('Error fetching databases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch databases from Notion' },
      { status: 500 }
    );
  }
}
