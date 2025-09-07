-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create custom types
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE project_status AS ENUM ('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'blocked');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'completed', 'failed');

-- Create workspaces table (top-level tenant isolation)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    notion_workspace_id TEXT UNIQUE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    avatar TEXT,
    status client_status DEFAULT 'active',
    notion_id TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, email),
    UNIQUE(workspace_id, notion_id)
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'not_started',
    priority priority_level DEFAULT 'medium',
    start_date DATE,
    due_date DATE,
    budget DECIMAL(12,2),
    notion_id TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, notion_id)
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee TEXT,
    status task_status DEFAULT 'todo',
    priority priority_level DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[] DEFAULT '{}',
    notion_id TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, notion_id)
);

-- Create sync_logs table for tracking Notion synchronization
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID,
    operation TEXT NOT NULL, -- 'insert', 'update', 'delete', 'sync'
    status sync_status DEFAULT 'pending',
    notion_id TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create notion_tokens table for storing OAuth tokens
CREATE TABLE notion_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    bot_id TEXT,
    workspace_name TEXT,
    workspace_icon TEXT,
    owner_name TEXT,
    owner_email TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id)
);

-- Create database_mappings table for Notion database configuration
CREATE TABLE database_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    clients_db_id TEXT,
    projects_db_id TEXT,
    tasks_db_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id)
);

-- Create indexes for better performance
CREATE INDEX idx_clients_workspace_id ON clients(workspace_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_notion_id ON clients(notion_id) WHERE notion_id IS NOT NULL;

CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_due_date ON projects(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_projects_notion_id ON projects(notion_id) WHERE notion_id IS NOT NULL;

CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee) WHERE assignee IS NOT NULL;
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_notion_id ON tasks(notion_id) WHERE notion_id IS NOT NULL;

CREATE INDEX idx_sync_logs_workspace_id ON sync_logs(workspace_id);
CREATE INDEX idx_sync_logs_table_record ON sync_logs(table_name, record_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at);

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notion_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Workspace policies
CREATE POLICY "Users can view their own workspaces" ON workspaces
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own workspaces" ON workspaces
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own workspaces" ON workspaces
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own workspaces" ON workspaces
    FOR DELETE USING (owner_id = auth.uid());

-- Helper function to get user's workspace IDs
CREATE OR REPLACE FUNCTION get_user_workspace_ids()
RETURNS TABLE(workspace_id UUID) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT w.id FROM workspaces w WHERE w.owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Client policies
CREATE POLICY "Users can view clients in their workspaces" ON clients
    FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can create clients in their workspaces" ON clients
    FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can update clients in their workspaces" ON clients
    FOR UPDATE USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can delete clients in their workspaces" ON clients
    FOR DELETE USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Project policies
CREATE POLICY "Users can view projects in their workspaces" ON projects
    FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can create projects in their workspaces" ON projects
    FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can update projects in their workspaces" ON projects
    FOR UPDATE USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can delete projects in their workspaces" ON projects
    FOR DELETE USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Task policies
CREATE POLICY "Users can view tasks in their workspaces" ON tasks
    FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can create tasks in their workspaces" ON tasks
    FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can update tasks in their workspaces" ON tasks
    FOR UPDATE USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can delete tasks in their workspaces" ON tasks
    FOR DELETE USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Sync logs policies
CREATE POLICY "Users can view sync logs in their workspaces" ON sync_logs
    FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can create sync logs in their workspaces" ON sync_logs
    FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can update sync logs in their workspaces" ON sync_logs
    FOR UPDATE USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Notion tokens policies
CREATE POLICY "Users can view their notion tokens" ON notion_tokens
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their notion tokens" ON notion_tokens
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their notion tokens" ON notion_tokens
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their notion tokens" ON notion_tokens
    FOR DELETE USING (user_id = auth.uid());

-- Database mappings policies
CREATE POLICY "Users can view database mappings in their workspaces" ON database_mappings
    FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can create database mappings in their workspaces" ON database_mappings
    FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can update database mappings in their workspaces" ON database_mappings
    FOR UPDATE USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Users can delete database mappings in their workspaces" ON database_mappings
    FOR DELETE USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notion_tokens_updated_at BEFORE UPDATE ON notion_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_database_mappings_updated_at BEFORE UPDATE ON database_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get tasks with project and client info
CREATE OR REPLACE FUNCTION get_tasks_with_details(p_workspace_id UUID, p_client_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    workspace_id UUID,
    client_id UUID,
    project_id UUID,
    title TEXT,
    description TEXT,
    assignee TEXT,
    status task_status,
    priority priority_level,
    due_date TIMESTAMPTZ,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[],
    notion_id TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    project_name TEXT,
    project_status project_status,
    client_name TEXT,
    client_email TEXT
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.workspace_id,
        t.client_id,
        t.project_id,
        t.title,
        t.description,
        t.assignee,
        t.status,
        t.priority,
        t.due_date,
        t.estimated_hours,
        t.actual_hours,
        t.tags,
        t.notion_id,
        t.created_at,
        t.updated_at,
        p.name as project_name,
        p.status as project_status,
        c.name as client_name,
        c.email as client_email
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN clients c ON t.client_id = c.id
    WHERE t.workspace_id = p_workspace_id
    AND (p_client_id IS NULL OR t.client_id = p_client_id)
    AND t.workspace_id IN (SELECT get_user_workspace_ids());
END;
$$ LANGUAGE plpgsql;
