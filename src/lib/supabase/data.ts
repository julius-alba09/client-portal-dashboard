import { createClient } from './server'
import type { Database } from '@/types/supabase'

// Types for easier use
type Client = Database['public']['Tables']['clients']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Workspace = Database['public']['Tables']['workspaces']['Row']

export interface ClientWithProjects extends Client {
  projects?: Project[]
}

export interface ProjectWithClient extends Project {
  client?: Client
}

export interface TaskWithProject extends Task {
  project?: ProjectWithClient
}

// Workspace operations
export async function createWorkspace(name: string, userId: string): Promise<Workspace | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, owner_id: userId })
    .select()
    .single()

  if (error) {
    console.error('Error creating workspace:', error)
    return null
  }
  return data
}

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workspaces:', error)
    return []
  }
  return data || []
}

export async function getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (error) {
    console.error('Error fetching workspace:', error)
    return null
  }
  return data
}

// Client operations
export async function getClients(workspaceId: string): Promise<Client[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }
  return data || []
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return null
  }
  return data
}

export async function createNewClient(workspaceId: string, clientData: {
  name: string
  email: string
  company?: string
  avatar?: string
  status?: 'active' | 'inactive' | 'pending'
  notion_id?: string
}): Promise<Client | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({ workspace_id: workspaceId, ...clientData })
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    return null
  }
  return data
}

// Project operations
export async function getProjects(workspaceId: string, clientId?: string): Promise<Project[]> {
  const supabase = await createClient()
  let query = supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }
  return data || []
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }
  return data
}

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client projects:', error)
    return []
  }
  return data || []
}

// Task operations
export async function getTasks(workspaceId: string, clientId?: string): Promise<Task[]> {
  const supabase = await createClient()
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
  return data || []
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) {
    console.error('Error fetching task:', error)
    return null
  }
  return data
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching project tasks:', error)
    return []
  }
  return data || []
}

export async function getTasksByClientId(clientId: string): Promise<Task[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching client tasks:', error)
    return []
  }
  return data || []
}

// Rich data operations (with joins)
export async function getTasksWithDetails(workspaceId: string, clientId?: string) {
  const supabase = await createClient()
  
  // Using the database function we created
  const { data, error } = await supabase
    .rpc('get_tasks_with_details', { 
      p_workspace_id: workspaceId, 
      p_client_id: clientId || null 
    })

  if (error) {
    console.error('Error fetching tasks with details:', error)
    return []
  }
  return data || []
}

export async function getClientsWithProjects(workspaceId: string): Promise<ClientWithProjects[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      projects (*)
    `)
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching clients with projects:', error)
    return []
  }
  return data || []
}

export async function getProjectsWithClient(workspaceId: string): Promise<ProjectWithClient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients (*)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects with clients:', error)
    return []
  }
  return data || []
}

// Update operations
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    console.error('Error updating task:', error)
    return null
  }
  return data
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return null
  }
  return data
}

export async function updateClient(clientId: string, updates: Partial<Client>): Promise<Client | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)
    .select()
    .single()

  if (error) {
    console.error('Error updating client:', error)
    return null
  }
  return data
}

// Dashboard stats
export async function getDashboardStats(workspaceId: string, clientId?: string) {
  const supabase = await createClient()
  
  // Get tasks stats
  let tasksQuery = supabase
    .from('tasks')
    .select('status')
    .eq('workspace_id', workspaceId)

  if (clientId) {
    tasksQuery = tasksQuery.eq('client_id', clientId)
  }

  const { data: tasks, error: tasksError } = await tasksQuery

  if (tasksError) {
    console.error('Error fetching tasks stats:', tasksError)
    return null
  }

  // Get projects stats
  let projectsQuery = supabase
    .from('projects')
    .select('status')
    .eq('workspace_id', workspaceId)

  if (clientId) {
    projectsQuery = projectsQuery.eq('client_id', clientId)
  }

  const { data: projects, error: projectsError } = await projectsQuery

  if (projectsError) {
    console.error('Error fetching projects stats:', projectsError)
    return null
  }

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length || 0
  const overdueTasks = 0 // TODO: Calculate based on due_date

  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    totalProjects,
    activeProjects
  }
}
