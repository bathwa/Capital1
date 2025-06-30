/*
  # Row Level Security Policies

  1. Security Policies
    - Users can access their own data and public data
    - Organization members can access organization data
    - Project members can access project data
    - Admins have full access to everything
    - Activity logs are read-only for users, full access for admins

  2. Policy Types
    - SELECT: Read access policies
    - INSERT: Create access policies  
    - UPDATE: Modify access policies
    - DELETE: Remove access policies
*/

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND organization_id = org_id
  ) OR EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = org_id AND owner_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check project access
CREATE OR REPLACE FUNCTION public.has_project_access(project_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  project_record RECORD;
BEGIN
  SELECT * INTO project_record FROM public.projects WHERE id = project_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Project owner has access
  IF project_record.owner_id = user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Organization members have access if project belongs to organization
  IF project_record.organization_id IS NOT NULL THEN
    RETURN public.is_organization_member(project_record.organization_id, user_id);
  END IF;
  
  -- Task assignees have access
  IF EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE project_id = project_record.id AND assigned_to_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS TABLE POLICIES
-- Users can view their own profile and basic info of others
CREATE POLICY "users_select_own_and_public" ON public.users
  FOR SELECT USING (
    id = auth.uid() OR 
    public.is_admin() OR
    TRUE -- Allow viewing basic public profile info
  );

-- Users can update their own profile, admins can update any
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (
    id = auth.uid() OR 
    public.is_admin()
  );

-- Only admins can delete users
CREATE POLICY "users_delete_admin_only" ON public.users
  FOR DELETE USING (public.is_admin());

-- Block direct inserts (handled by trigger)
CREATE POLICY "users_insert_blocked" ON public.users
  FOR INSERT WITH CHECK (FALSE);

-- ORGANIZATIONS TABLE POLICIES
-- Users can view organizations they're members of or own
CREATE POLICY "organizations_select_member_or_owner" ON public.organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR
    public.is_organization_member(id) OR
    public.is_admin()
  );

-- Authenticated users can create organizations
CREATE POLICY "organizations_insert_authenticated" ON public.organizations
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    owner_id = auth.uid()
  );

-- Owners and admins can update organizations
CREATE POLICY "organizations_update_owner_or_admin" ON public.organizations
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    public.is_admin()
  );

-- Owners and admins can delete organizations
CREATE POLICY "organizations_delete_owner_or_admin" ON public.organizations
  FOR DELETE USING (
    owner_id = auth.uid() OR
    public.is_admin()
  );

-- PROJECTS TABLE POLICIES
-- Users can view projects they have access to
CREATE POLICY "projects_select_accessible" ON public.projects
  FOR SELECT USING (
    owner_id = auth.uid() OR
    public.has_project_access(id) OR
    public.is_admin()
  );

-- Authenticated users can create projects
CREATE POLICY "projects_insert_authenticated" ON public.projects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    owner_id = auth.uid() AND
    (organization_id IS NULL OR public.is_organization_member(organization_id))
  );

-- Project owners and admins can update projects
CREATE POLICY "projects_update_owner_or_admin" ON public.projects
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    public.is_admin()
  );

-- Project owners and admins can delete projects
CREATE POLICY "projects_delete_owner_or_admin" ON public.projects
  FOR DELETE USING (
    owner_id = auth.uid() OR
    public.is_admin()
  );

-- TASKS TABLE POLICIES
-- Users can view tasks in projects they have access to
CREATE POLICY "tasks_select_project_access" ON public.tasks
  FOR SELECT USING (
    public.has_project_access(project_id) OR
    assigned_to_id = auth.uid() OR
    created_by_id = auth.uid() OR
    public.is_admin()
  );

-- Users can create tasks in projects they have access to
CREATE POLICY "tasks_insert_project_access" ON public.tasks
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by_id = auth.uid() AND
    public.has_project_access(project_id)
  );

-- Task assignees, creators, project owners, and admins can update tasks
CREATE POLICY "tasks_update_assignee_creator_owner_admin" ON public.tasks
  FOR UPDATE USING (
    assigned_to_id = auth.uid() OR
    created_by_id = auth.uid() OR
    public.has_project_access(project_id) OR
    public.is_admin()
  );

-- Project owners and admins can delete tasks
CREATE POLICY "tasks_delete_owner_or_admin" ON public.tasks
  FOR DELETE USING (
    public.has_project_access(project_id) OR
    public.is_admin()
  );

-- COMMENTS TABLE POLICIES
-- Users can view comments on entities they have access to
CREATE POLICY "comments_select_entity_access" ON public.comments
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.is_admin() OR
    CASE entity_type
      WHEN 'project' THEN public.has_project_access(entity_id)
      WHEN 'task' THEN EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.id = entity_id AND public.has_project_access(t.project_id)
      )
      ELSE TRUE
    END
  );

-- Authenticated users can create comments on entities they have access to
CREATE POLICY "comments_insert_entity_access" ON public.comments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid() AND
    CASE entity_type
      WHEN 'project' THEN public.has_project_access(entity_id)
      WHEN 'task' THEN EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.id = entity_id AND public.has_project_access(t.project_id)
      )
      ELSE TRUE
    END
  );

-- Comment creators and admins can update comments
CREATE POLICY "comments_update_creator_or_admin" ON public.comments
  FOR UPDATE USING (
    user_id = auth.uid() OR
    public.is_admin()
  );

-- Comment creators, entity owners, and admins can delete comments
CREATE POLICY "comments_delete_creator_owner_admin" ON public.comments
  FOR DELETE USING (
    user_id = auth.uid() OR
    public.is_admin() OR
    CASE entity_type
      WHEN 'project' THEN EXISTS (
        SELECT 1 FROM public.projects p 
        WHERE p.id = entity_id AND p.owner_id = auth.uid()
      )
      WHEN 'task' THEN EXISTS (
        SELECT 1 FROM public.tasks t 
        JOIN public.projects p ON t.project_id = p.id
        WHERE t.id = entity_id AND p.owner_id = auth.uid()
      )
      ELSE FALSE
    END
  );

-- ATTACHMENTS TABLE POLICIES
-- Users can view attachments on entities they have access to
CREATE POLICY "attachments_select_entity_access" ON public.attachments
  FOR SELECT USING (
    uploaded_by_id = auth.uid() OR
    is_public = TRUE OR
    public.is_admin() OR
    CASE entity_type
      WHEN 'project' THEN public.has_project_access(entity_id)
      WHEN 'task' THEN EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.id = entity_id AND public.has_project_access(t.project_id)
      )
      ELSE TRUE
    END
  );

-- Authenticated users can upload attachments to entities they have access to
CREATE POLICY "attachments_insert_entity_access" ON public.attachments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    uploaded_by_id = auth.uid() AND
    CASE entity_type
      WHEN 'project' THEN public.has_project_access(entity_id)
      WHEN 'task' THEN EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.id = entity_id AND public.has_project_access(t.project_id)
      )
      ELSE TRUE
    END
  );

-- Uploaders and admins can update attachments
CREATE POLICY "attachments_update_uploader_or_admin" ON public.attachments
  FOR UPDATE USING (
    uploaded_by_id = auth.uid() OR
    public.is_admin()
  );

-- Uploaders, entity owners, and admins can delete attachments
CREATE POLICY "attachments_delete_uploader_owner_admin" ON public.attachments
  FOR DELETE USING (
    uploaded_by_id = auth.uid() OR
    public.is_admin() OR
    CASE entity_type
      WHEN 'project' THEN EXISTS (
        SELECT 1 FROM public.projects p 
        WHERE p.id = entity_id AND p.owner_id = auth.uid()
      )
      WHEN 'task' THEN EXISTS (
        SELECT 1 FROM public.tasks t 
        JOIN public.projects p ON t.project_id = p.id
        WHERE t.id = entity_id AND p.owner_id = auth.uid()
      )
      ELSE FALSE
    END
  );

-- ACTIVITY LOGS TABLE POLICIES
-- Users can view their own activity logs, admins can view all
CREATE POLICY "activity_logs_select_own_or_admin" ON public.activity_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.is_admin()
  );

-- Authenticated users can insert their own activity logs
CREATE POLICY "activity_logs_insert_own" ON public.activity_logs
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- No updates or deletes allowed on activity logs (immutable audit trail)
CREATE POLICY "activity_logs_no_update" ON public.activity_logs
  FOR UPDATE USING (FALSE);

CREATE POLICY "activity_logs_no_delete" ON public.activity_logs
  FOR DELETE USING (FALSE);