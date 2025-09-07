import { Client, Project, Task } from '@/types';

export const dummyClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@techcorp.com',
    company: 'Tech Corp',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    notion_id: 'notion_client_1'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@designstudio.com',
    company: 'Creative Design Studio',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9d95e1a?w=400&h=400&fit=crop&crop=face',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-08'),
    notion_id: 'notion_client_2'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael@startupventures.io',
    company: 'Startup Ventures',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
    notion_id: 'notion_client_3'
  }
];

export const dummyProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design and improved UX',
    client_id: '1',
    status: 'in_progress',
    priority: 'high',
    start_date: new Date('2024-01-20'),
    due_date: new Date('2024-04-15'),
    budget: 15000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    notion_id: 'notion_project_1'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native iOS and Android app for customer engagement',
    client_id: '1',
    status: 'not_started',
    priority: 'medium',
    start_date: new Date('2024-04-01'),
    due_date: new Date('2024-08-30'),
    budget: 45000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    notion_id: 'notion_project_2'
  },
  {
    id: '3',
    name: 'Brand Identity Package',
    description: 'Complete brand identity design including logo, colors, and guidelines',
    client_id: '2',
    status: 'in_progress',
    priority: 'high',
    start_date: new Date('2024-02-15'),
    due_date: new Date('2024-03-30'),
    budget: 8000,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-08'),
    notion_id: 'notion_project_3'
  },
  {
    id: '4',
    name: 'MVP Development',
    description: 'Minimum viable product development for the startup',
    client_id: '3',
    status: 'on_hold',
    priority: 'urgent',
    start_date: new Date('2024-03-15'),
    due_date: new Date('2024-06-01'),
    budget: 25000,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
    notion_id: 'notion_project_4'
  }
];

export const dummyTasks: Task[] = [
  // Website Redesign tasks
  {
    id: '1',
    title: 'Conduct user research and analysis',
    description: 'Interview existing users and analyze current website analytics',
    project_id: '1',
    assignee: 'Alice Cooper',
    status: 'done',
    priority: 'high',
    due_date: new Date('2024-02-01'),
    estimated_hours: 16,
    actual_hours: 18,
    tags: ['research', 'ux'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-02'),
    notion_id: 'notion_task_1'
  },
  {
    id: '2',
    title: 'Create wireframes and mockups',
    description: 'Design initial wireframes for all key pages',
    project_id: '1',
    assignee: 'Bob Designer',
    status: 'in_progress',
    priority: 'high',
    due_date: new Date('2024-03-15'),
    estimated_hours: 24,
    actual_hours: 12,
    tags: ['design', 'wireframes'],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-10'),
    notion_id: 'notion_task_2'
  },
  {
    id: '3',
    title: 'Develop responsive navigation',
    description: 'Implement responsive navigation component',
    project_id: '1',
    assignee: 'Carol Developer',
    status: 'todo',
    priority: 'medium',
    due_date: new Date('2024-03-20'),
    estimated_hours: 12,
    tags: ['development', 'frontend'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    notion_id: 'notion_task_3'
  },
  {
    id: '4',
    title: 'Set up CMS integration',
    description: 'Configure headless CMS for content management',
    project_id: '1',
    assignee: 'Dave Backend',
    status: 'review',
    priority: 'medium',
    due_date: new Date('2024-03-25'),
    estimated_hours: 20,
    actual_hours: 22,
    tags: ['development', 'backend', 'cms'],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-12'),
    notion_id: 'notion_task_4'
  },
  
  // Brand Identity Package tasks
  {
    id: '5',
    title: 'Brand strategy workshop',
    description: 'Conduct workshop with stakeholders to define brand direction',
    project_id: '3',
    assignee: 'Emma Brand',
    status: 'done',
    priority: 'high',
    due_date: new Date('2024-02-20'),
    estimated_hours: 8,
    actual_hours: 10,
    tags: ['branding', 'strategy'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-22'),
    notion_id: 'notion_task_5'
  },
  {
    id: '6',
    title: 'Logo design concepts',
    description: 'Create 3-5 initial logo concepts for client review',
    project_id: '3',
    assignee: 'Frank Designer',
    status: 'in_progress',
    priority: 'high',
    due_date: new Date('2024-03-10'),
    estimated_hours: 16,
    actual_hours: 8,
    tags: ['design', 'logo'],
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-03-08'),
    notion_id: 'notion_task_6'
  },
  {
    id: '7',
    title: 'Color palette development',
    description: 'Develop comprehensive color palette with accessibility considerations',
    project_id: '3',
    assignee: 'Grace Color',
    status: 'todo',
    priority: 'medium',
    due_date: new Date('2024-03-12'),
    estimated_hours: 6,
    tags: ['design', 'colors'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    notion_id: 'notion_task_7'
  },

  // MVP Development tasks
  {
    id: '8',
    title: 'Technical architecture planning',
    description: 'Define system architecture and technology stack',
    project_id: '4',
    assignee: 'Henry Architect',
    status: 'blocked',
    priority: 'urgent',
    due_date: new Date('2024-03-20'),
    estimated_hours: 24,
    tags: ['architecture', 'planning'],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-18'),
    notion_id: 'notion_task_8'
  },
  {
    id: '9',
    title: 'Database schema design',
    description: 'Design and implement initial database schema',
    project_id: '4',
    assignee: 'Ivy Database',
    status: 'todo',
    priority: 'high',
    due_date: new Date('2024-03-25'),
    estimated_hours: 16,
    tags: ['database', 'backend'],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    notion_id: 'notion_task_9'
  },
  {
    id: '10',
    title: 'User authentication system',
    description: 'Implement secure user authentication and authorization',
    project_id: '4',
    assignee: 'Jack Security',
    status: 'todo',
    priority: 'high',
    due_date: new Date('2024-04-01'),
    estimated_hours: 20,
    tags: ['security', 'authentication'],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    notion_id: 'notion_task_10'
  }
];

// Helper functions to get related data
export function getClientById(id: string): Client | undefined {
  return dummyClients.find(client => client.id === id);
}

export function getProjectById(id: string): Project | undefined {
  return dummyProjects.find(project => project.id === id);
}

export function getProjectsByClientId(clientId: string): Project[] {
  return dummyProjects.filter(project => project.client_id === clientId);
}

export function getTasksByProjectId(projectId: string): Task[] {
  return dummyTasks.filter(task => task.project_id === projectId);
}

export function getTasksByClientId(clientId: string): Task[] {
  const clientProjects = getProjectsByClientId(clientId);
  const projectIds = clientProjects.map(project => project.id);
  return dummyTasks.filter(task => projectIds.includes(task.project_id));
}

export function getTasksWithProject(): (Task & { project: Project })[] {
  return dummyTasks.map(task => ({
    ...task,
    project: dummyProjects.find(project => project.id === task.project_id)!
  }));
}

export function getProjectsWithClient(): (Project & { client: Client })[] {
  return dummyProjects.map(project => ({
    ...project,
    client: dummyClients.find(client => client.id === project.client_id)!
  }));
}
