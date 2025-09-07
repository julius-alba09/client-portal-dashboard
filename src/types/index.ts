// Core entity types matching Notion database structure

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  notion_id?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  client?: Client;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: Date;
  due_date?: Date;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
  notion_id?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  project?: Project;
  assignee?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  notion_id?: string;
}

// UI component types
export type ViewType = 'table' | 'kanban' | 'calendar';

export interface TaskViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

// Theme types
export type Theme = 'light' | 'dark';

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  client_id?: string; // Only set for client users
}

// Notion API types
export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, any>;
}

export interface NotionPage {
  id: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
}

// Filter and sort types for task views
export interface TaskFilter {
  status?: Task['status'][];
  priority?: Task['priority'][];
  assignee?: string[];
  project?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TaskSort {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

// Kanban board types
export interface KanbanColumn {
  id: Task['status'];
  title: string;
  tasks: Task[];
  color: string;
}

// Calendar event type for task display
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  task: Task;
  color: string;
}

// Dashboard stats type
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
}
