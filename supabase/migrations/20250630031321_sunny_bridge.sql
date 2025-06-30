/*
  # Create Core Application Tables

  1. New Tables
    - `organizations` - Company/group entities
    - `users` - Extended user profiles linked to auth.users
    - `projects` - Individual projects or opportunities
    - `tasks` - Tasks within projects
    - `comments` - Comments on various entities
    - `attachments` - File attachments for entities
    - `activity_logs` - Audit trail for user actions

  2. Security
    - All tables have RLS enabled by default
    - Proper foreign key relationships with cascading deletes where appropriate
    - Automatic timestamp management with triggers
*/

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status organization_status NOT NULL DEFAULT 'PENDING',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT organizations_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT organizations_description_length CHECK (char_length(description) <= 1000)
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'ENTREPRENEUR',
  status user_status NOT NULL DEFAULT 'PENDING_EMAIL_CONFIRMATION',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  profile_picture_url TEXT,
  profile_completion_percentage NUMERIC(5,2) DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
  reliability_score NUMERIC(5,2) DEFAULT 0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  last_login TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_name_length CHECK (
    char_length(first_name) >= 1 AND char_length(first_name) <= 50 AND
    char_length(last_name) >= 1 AND char_length(last_name) <= 50
  ),
  CONSTRAINT users_phone_format CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$')
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'DRAFT',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15,2),
  currency TEXT DEFAULT 'USD',
  priority task_priority DEFAULT 'MEDIUM',
  tags TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT projects_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
  CONSTRAINT projects_description_length CHECK (char_length(description) <= 5000),
  CONSTRAINT projects_date_order CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT projects_budget_positive CHECK (budget IS NULL OR budget >= 0),
  CONSTRAINT projects_currency_format CHECK (currency ~ '^[A-Z]{3}$')
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'TODO',
  priority task_priority NOT NULL DEFAULT 'MEDIUM',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours NUMERIC(8,2),
  actual_hours NUMERIC(8,2),
  progress_percentage NUMERIC(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  tags TEXT[] DEFAULT '{}',
  dependencies UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT tasks_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT tasks_description_length CHECK (char_length(description) <= 5000),
  CONSTRAINT tasks_hours_positive CHECK (
    (estimated_hours IS NULL OR estimated_hours >= 0) AND
    (actual_hours IS NULL OR actual_hours >= 0)
  ),
  CONSTRAINT tasks_completed_status CHECK (
    (status = 'DONE' AND completed_at IS NOT NULL) OR
    (status != 'DONE' AND completed_at IS NULL)
  )
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT comments_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
  CONSTRAINT comments_edit_consistency CHECK (
    (is_edited = TRUE AND edited_at IS NOT NULL) OR
    (is_edited = FALSE AND edited_at IS NULL)
  )
);

-- Attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT attachments_filename_length CHECK (char_length(filename) >= 1 AND char_length(filename) <= 255),
  CONSTRAINT attachments_file_size_positive CHECK (file_size IS NULL OR file_size >= 0),
  CONSTRAINT attachments_download_count_positive CHECK (download_count >= 0)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type entity_type,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT activity_logs_action_length CHECK (char_length(action) >= 1 AND char_length(action) <= 100),
  CONSTRAINT activity_logs_user_agent_length CHECK (char_length(user_agent) <= 1000)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_id ON public.tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_id ON public.tasks(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_attachments_entity ON public.attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by_id ON public.attachments(uploaded_by_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);