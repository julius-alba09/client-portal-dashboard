import { createNotionClient } from '@/lib/notion-oauth';
import { Client, Project, Task } from '@/types';
import { cookies } from 'next/headers';

/**
 * Get user's Notion configuration from cookies (in production, get from database)
 */
async function getNotionConfig(): Promise<{
  accessToken: string;
  databaseConfig: {
    clientsDatabase: string;
    projectsDatabase: string;
    tasksDatabase: string;
  };
} | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('notion_access_token')?.value;
  const configCookie = cookieStore.get('notion_database_config')?.value;

  if (!accessToken || !configCookie) {
    return null;
  }

  try {
    const databaseConfig = JSON.parse(configCookie);
    return { accessToken, databaseConfig };
  } catch (error) {
    console.error('Failed to parse database config:', error);
    return null;
  }
}

/**
 * Helper function to extract text from Notion rich text property
 */
function extractText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(rt => rt.plain_text || rt.text?.content || '').join('');
}

/**
 * Helper function to extract date from Notion date property
 */
function extractDate(dateProperty: any): Date | undefined {
  if (!dateProperty?.date?.start) return undefined;
  return new Date(dateProperty.date.start);
}

/**
 * Helper function to extract select value from Notion select property
 */
function extractSelect(selectProperty: any): string {
  return selectProperty?.select?.name || '';
}

/**
 * Helper function to extract multi-select values from Notion multi-select property
 */
function extractMultiSelect(multiSelectProperty: any): string[] {
  if (!multiSelectProperty?.multi_select) return [];
  return multiSelectProperty.multi_select.map((item: any) => item.name);
}

/**
 * Helper function to extract number from Notion number property
 */
function extractNumber(numberProperty: any): number | undefined {
  return numberProperty?.number || undefined;
}

/**
 * Helper function to extract email from Notion email property
 */
function extractEmail(emailProperty: any): string {
  return emailProperty?.email || '';
}

/**
 * Helper function to extract relation IDs
 */
function extractRelation(relationProperty: any): string[] {
  if (!relationProperty?.relation) return [];
  return relationProperty.relation.map((item: any) => item.id);
}

/**
 * Fetch all clients from user's configured Notion database
 */
export async function fetchNotionClients(): Promise<Client[]> {
  const config = await getNotionConfig();
  if (!config) {
    throw new Error('Notion not configured');
  }

  // For demo purposes, return empty array to avoid API complexity
  // In production, implement full Notion API calls here
  console.log('Notion configured but using fallback data for demo');
  throw new Error('Using fallback to dummy data');
}

/**
 * Fetch a specific client by ID from Notion
 */
export async function fetchNotionClient(id: string): Promise<Client | null> {
  const config = await getNotionConfig();
  if (!config) {
    throw new Error('Notion not configured');
  }

  // For demo purposes, throw error to use fallback data
  console.log('Notion configured but using fallback data for demo');
  throw new Error('Using fallback to dummy data');
}

/**
 * Fetch projects for a specific client from Notion
 */
export async function fetchNotionProjectsByClient(clientId: string): Promise<Project[]> {
  const config = await getNotionConfig();
  if (!config) {
    throw new Error('Notion not configured');
  }

  // For demo purposes, throw error to use fallback data
  console.log('Notion configured but using fallback data for demo');
  throw new Error('Using fallback to dummy data');
}

/**
 * Fetch tasks for a specific project from Notion
 */
export async function fetchNotionTasksByProject(projectId: string): Promise<Task[]> {
  const config = await getNotionConfig();
  if (!config) {
    throw new Error('Notion not configured');
  }

  // For demo purposes, throw error to use fallback data
  console.log('Notion configured but using fallback data for demo');
  throw new Error('Using fallback to dummy data');
}

/**
 * Fetch all tasks for a specific client (across all their projects)
 */
export async function fetchNotionTasksByClient(clientId: string): Promise<Task[]> {
  try {
    // First, get all projects for this client
    const projects = await fetchNotionProjectsByClient(clientId);
    const projectIds = projects.map(p => p.id);

    if (projectIds.length === 0) {
      return [];
    }

    // Then fetch tasks for all those projects
    const taskPromises = projectIds.map(projectId => fetchNotionTasksByProject(projectId));
    const taskArrays = await Promise.all(taskPromises);
    
    // Flatten the arrays and add project info to tasks
    const allTasks = taskArrays.flat();
    
    return allTasks.map(task => ({
      ...task,
      project: projects.find(p => p.id === task.project_id),
    }));
  } catch (error) {
    console.error('Error fetching client tasks from Notion:', error);
    throw new Error('Failed to fetch client tasks from Notion');
  }
}

/**
 * Update a task in Notion
 */
export async function updateNotionTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
  const config = await getNotionConfig();
  if (!config) {
    throw new Error('Notion not configured');
  }

  // For demo purposes, simulate successful update
  console.log('Notion configured, simulating task update:', { taskId, updates });
  return true;
}

/**
 * Create a new task in Notion
 */
export async function createNotionTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'notion_id'>): Promise<string | null> {
  const config = await getNotionConfig();
  if (!config) {
    throw new Error('Notion not configured');
  }

  // For demo purposes, simulate successful creation
  console.log('Notion configured, simulating task creation:', task);
  return `simulated-task-${Date.now()}`;
}
