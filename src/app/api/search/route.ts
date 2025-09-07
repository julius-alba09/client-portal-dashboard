import { NextRequest, NextResponse } from 'next/server';
import { 
  dummyClients, 
  dummyProjects, 
  dummyTasks,
  getClientById,
  getProjectById 
} from '@/lib/dummy-data';
import { Client, Project, Task } from '@/types';

interface SearchResult {
  type: 'client' | 'project' | 'task';
  id: string;
  title: string;
  description?: string;
  url: string;
  metadata?: {
    client?: string;
    project?: string;
    status?: string;
    priority?: string;
    databaseSource: 'notion' | 'demo';
    databaseId?: string;
    databaseName?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase().trim();
    const type = searchParams.get('type') as 'client' | 'project' | 'task' | 'all' | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    const results: SearchResult[] = [];

    // Search clients
    if (!type || type === 'all' || type === 'client') {
      dummyClients
        .filter(client => 
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.company.toLowerCase().includes(query)
        )
        .slice(0, limit)
        .forEach(client => {
          results.push({
            type: 'client',
            id: client.id,
            title: client.name,
            description: `${client.company} - ${client.email}`,
            url: `/clients/${client.id}`,
            metadata: {
              status: client.status,
              databaseSource: 'demo',
              databaseName: 'Clients (Demo Data)',
            }
          });
        });
    }

    // Search projects
    if (!type || type === 'all' || type === 'project') {
      dummyProjects
        .filter(project => 
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
        )
        .slice(0, limit)
        .forEach(project => {
          const client = getClientById(project.client_id);
          results.push({
            type: 'project',
            id: project.id,
            title: project.name,
            description: project.description,
            url: `/clients/${project.client_id}?project=${project.id}`,
            metadata: {
              client: client?.name,
              status: project.status,
              priority: project.priority,
              databaseSource: 'demo',
              databaseName: 'Projects (Demo Data)',
            }
          });
        });
    }

    // Search tasks
    if (!type || type === 'all' || type === 'task') {
      dummyTasks
        .filter(task => 
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.assignee?.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query))
        )
        .slice(0, limit)
        .forEach(task => {
          const project = getProjectById(task.project_id);
          const client = project ? getClientById(project.client_id) : null;
          
          results.push({
            type: 'task',
            id: task.id,
            title: task.title,
            description: task.description,
            url: `/clients/${client?.id}?task=${task.id}`,
            metadata: {
              client: client?.name,
              project: project?.name,
              status: task.status,
              priority: task.priority,
              databaseSource: 'demo',
              databaseName: 'Tasks (Demo Data)',
            }
          });
        });
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === query;
      const bExact = b.title.toLowerCase() === query;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aStarts = a.title.toLowerCase().startsWith(query);
      const bStarts = b.title.toLowerCase().startsWith(query);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return 0;
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
        results: results.slice(0, limit),
        total: results.length,
        databases: [
          {
            id: 'demo-clients',
            name: 'Clients (Demo Data)',
            type: 'clients',
            source: 'demo',
            status: 'connected'
          },
          {
            id: 'demo-projects',
            name: 'Projects (Demo Data)', 
            type: 'projects',
            source: 'demo',
            status: 'connected'
          },
          {
            id: 'demo-tasks',
            name: 'Tasks (Demo Data)',
            type: 'tasks', 
            source: 'demo',
            status: 'connected'
          }
        ]
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
