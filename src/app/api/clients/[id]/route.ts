import { NextRequest, NextResponse } from 'next/server';
import { getClientById, getProjectsByClientId, getTasksByClientId } from '@/lib/dummy-data';
import { fetchNotionClient, fetchNotionProjectsByClient, fetchNotionTasksByClient } from '@/lib/notion-data';
import { dataCache } from '@/lib/performance/lazy-loading';

// Enable edge runtime for ultra-fast cold starts
export const runtime = 'edge';

// Cache configuration for ultra-fast responses
const CACHE_TTL = 60 * 5; // 5 minutes
const STALE_WHILE_REVALIDATE = 60 * 30; // 30 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = performance.now();
  
  try {
    const { id: clientId } = await params;
    const cacheKey = `client-data-${clientId}`;

    // Check cache first for ultra-fast response
    const cachedData = dataCache.get(cacheKey);
    if (cachedData) {
      const responseTime = performance.now() - startTime;
      
      return NextResponse.json(
        {
          success: true,
          data: cachedData,
          cached: true,
          responseTime: Math.round(responseTime * 100) / 100
        },
        {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
            'X-Cache': 'HIT',
            'X-Response-Time': `${Math.round(responseTime)}ms`
          }
        }
      );
    }

    // Memoized data fetching function
    const fetchData = async () => {
      let client, projects, tasks;

      try {
        // Parallel fetch for better performance
        const [notionClient, notionProjects, notionTasks] = await Promise.allSettled([
          fetchNotionClient(clientId),
          fetchNotionProjectsByClient(clientId),
          fetchNotionTasksByClient(clientId)
        ]);

        if (notionClient.status === 'fulfilled' && notionClient.value) {
          client = notionClient.value;
          projects = notionProjects.status === 'fulfilled' ? notionProjects.value : [];
          tasks = notionTasks.status === 'fulfilled' ? notionTasks.value : [];
        }
      } catch (notionError) {
        console.warn('Notion integration not available, using dummy data:', notionError);
      }

      // Fallback to dummy data if Notion is not configured or fails
      if (!client) {
        // Use parallel dummy data fetching
        [client, projects, tasks] = [
          getClientById(clientId),
          getProjectsByClientId(clientId),
          getTasksByClientId(clientId)
        ];
      }

      return { client, projects, tasks };
    };

    const data = await fetchData();

    if (!data.client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }
      );
    }

    // Cache the successful response
    dataCache.set(cacheKey, data);
    
    const responseTime = performance.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data,
        cached: false,
        responseTime: Math.round(responseTime * 100) / 100
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          'X-Cache': 'MISS',
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Data-Source': data.client.notion_id ? 'notion' : 'dummy'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching client data:', error);
    const responseTime = performance.now() - startTime;
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
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
