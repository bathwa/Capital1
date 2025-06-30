/*
  # Views and Utility Functions

  1. Views
    - user_profiles_with_stats: Enhanced user profiles with statistics
    - project_dashboard: Project overview with task counts and progress
    - organization_members: Organization membership details
    - recent_activity: Recent activity feed

  2. Utility Functions
    - get_user_projects: Get projects accessible to a user
    - get_project_stats: Get project statistics
    - search_projects: Full-text search for projects
    - get_user_activity_feed: Get activity feed for a user
*/

-- View: Enhanced user profiles with statistics
CREATE OR REPLACE VIEW public.user_profiles_with_stats AS
SELECT 
  u.*,
  o.name as organization_name,
  (
    SELECT COUNT(*) 
    FROM public.projects p 
    WHERE p.owner_id = u.id
  ) as projects_owned,
  (
    SELECT COUNT(*) 
    FROM public.tasks t 
    WHERE t.assigned_to_id = u.id AND t.status != 'DONE'
  ) as active_tasks,
  (
    SELECT COUNT(*) 
    FROM public.tasks t 
    WHERE t.assigned_to_id = u.id AND t.status = 'DONE'
  ) as completed_tasks,
  (
    SELECT COUNT(*) 
    FROM public.comments c 
    WHERE c.user_id = u.id
  ) as total_comments
FROM public.users u
LEFT JOIN public.organizations o ON u.organization_id = o.id;

-- View: Project dashboard with statistics
CREATE OR REPLACE VIEW public.project_dashboard AS
SELECT 
  p.*,
  u.first_name || ' ' || u.last_name as owner_name,
  o.name as organization_name,
  (
    SELECT COUNT(*) 
    FROM public.tasks t 
    WHERE t.project_id = p.id
  ) as total_tasks,
  (
    SELECT COUNT(*) 
    FROM public.tasks t 
    WHERE t.project_id = p.id AND t.status = 'DONE'
  ) as completed_tasks,
  (
    SELECT COUNT(*) 
    FROM public.tasks t 
    WHERE t.project_id = p.id AND t.status IN ('TODO', 'IN_PROGRESS', 'REVIEW')
  ) as active_tasks,
  (
    SELECT COUNT(*) 
    FROM public.tasks t 
    WHERE t.project_id = p.id AND t.due_date < now() AND t.status != 'DONE'
  ) as overdue_tasks,
  (
    SELECT COALESCE(AVG(t.progress_percentage), 0)
    FROM public.tasks t 
    WHERE t.project_id = p.id
  ) as average_progress,
  (
    SELECT COUNT(DISTINCT c.user_id)
    FROM public.comments c 
    WHERE c.entity_type = 'project' AND c.entity_id = p.id
  ) as active_contributors
FROM public.projects p
LEFT JOIN public.users u ON p.owner_id = u.id
LEFT JOIN public.organizations o ON p.organization_id = o.id;

-- View: Organization members with roles and statistics
CREATE OR REPLACE VIEW public.organization_members AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  u.id as user_id,
  u.first_name || ' ' || u.last_name as user_name,
  u.email,
  u.role,
  u.status,
  CASE WHEN o.owner_id = u.id THEN 'OWNER' ELSE 'MEMBER' END as membership_role,
  u.created_at as joined_at,
  (
    SELECT COUNT(*) 
    FROM public.projects p 
    WHERE p.owner_id = u.id AND p.organization_id = o.id
  ) as projects_in_org,
  (
    SELECT COUNT(*) 
    FROM public.tasks t 
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.assigned_to_id = u.id AND p.organization_id = o.id
  ) as tasks_in_org
FROM public.organizations o
JOIN public.users u ON u.organization_id = o.id OR o.owner_id = u.id;

-- View: Recent activity feed
CREATE OR REPLACE VIEW public.recent_activity AS
SELECT 
  al.*,
  u.first_name || ' ' || u.last_name as user_name,
  u.profile_picture_url,
  CASE 
    WHEN al.entity_type = 'project' THEN (
      SELECT p.name FROM public.projects p WHERE p.id = al.entity_id
    )
    WHEN al.entity_type = 'task' THEN (
      SELECT t.title FROM public.tasks t WHERE t.id = al.entity_id
    )
    ELSE NULL
  END as entity_name
FROM public.activity_logs al
LEFT JOIN public.users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- Function: Get projects accessible to a user
CREATE OR REPLACE FUNCTION public.get_user_projects(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  status project_status,
  owner_id UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  access_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.status,
    p.owner_id,
    p.organization_id,
    p.created_at,
    p.updated_at,
    CASE 
      WHEN p.owner_id = user_id THEN 'OWNER'
      WHEN EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = user_id AND u.organization_id = p.organization_id
      ) THEN 'ORGANIZATION_MEMBER'
      WHEN EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.project_id = p.id AND t.assigned_to_id = user_id
      ) THEN 'TASK_ASSIGNEE'
      ELSE 'NO_ACCESS'
    END as access_level
  FROM public.projects p
  WHERE 
    p.owner_id = user_id OR
    public.has_project_access(p.id, user_id) OR
    public.is_admin(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get project statistics
CREATE OR REPLACE FUNCTION public.get_project_stats(project_id UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  active_tasks BIGINT,
  overdue_tasks BIGINT,
  average_progress NUMERIC,
  total_comments BIGINT,
  total_attachments BIGINT,
  team_members BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.tasks t WHERE t.project_id = get_project_stats.project_id),
    (SELECT COUNT(*) FROM public.tasks t WHERE t.project_id = get_project_stats.project_id AND t.status = 'DONE'),
    (SELECT COUNT(*) FROM public.tasks t WHERE t.project_id = get_project_stats.project_id AND t.status IN ('TODO', 'IN_PROGRESS', 'REVIEW')),
    (SELECT COUNT(*) FROM public.tasks t WHERE t.project_id = get_project_stats.project_id AND t.due_date < now() AND t.status != 'DONE'),
    (SELECT COALESCE(AVG(t.progress_percentage), 0) FROM public.tasks t WHERE t.project_id = get_project_stats.project_id),
    (SELECT COUNT(*) FROM public.comments c WHERE c.entity_type = 'project' AND c.entity_id = get_project_stats.project_id),
    (SELECT COUNT(*) FROM public.attachments a WHERE a.entity_type = 'project' AND a.entity_id = get_project_stats.project_id),
    (SELECT COUNT(DISTINCT COALESCE(t.assigned_to_id, t.created_by_id)) FROM public.tasks t WHERE t.project_id = get_project_stats.project_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search projects with full-text search
CREATE OR REPLACE FUNCTION public.search_projects(
  search_query TEXT,
  user_id UUID DEFAULT auth.uid(),
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  status project_status,
  owner_name TEXT,
  organization_name TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.status,
    u.first_name || ' ' || u.last_name as owner_name,
    o.name as organization_name,
    p.created_at,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM public.projects p
  LEFT JOIN public.users u ON p.owner_id = u.id
  LEFT JOIN public.organizations o ON p.organization_id = o.id
  WHERE 
    (
      p.owner_id = user_id OR
      public.has_project_access(p.id, user_id) OR
      public.is_admin(user_id)
    )
    AND (
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user activity feed
CREATE OR REPLACE FUNCTION public.get_user_activity_feed(
  user_id UUID DEFAULT auth.uid(),
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  action TEXT,
  entity_type entity_type,
  entity_id UUID,
  entity_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ,
  actor_name TEXT,
  actor_picture_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.entity_type,
    al.entity_id,
    CASE 
      WHEN al.entity_type = 'project' THEN (
        SELECT p.name FROM public.projects p WHERE p.id = al.entity_id
      )
      WHEN al.entity_type = 'task' THEN (
        SELECT t.title FROM public.tasks t WHERE t.id = al.entity_id
      )
      WHEN al.entity_type = 'organization' THEN (
        SELECT o.name FROM public.organizations o WHERE o.id = al.entity_id
      )
      ELSE 'Unknown'
    END as entity_name,
    al.details,
    al.created_at,
    COALESCE(u.first_name || ' ' || u.last_name, 'System') as actor_name,
    u.profile_picture_url as actor_picture_url
  FROM public.activity_logs al
  LEFT JOIN public.users u ON al.user_id = u.id
  WHERE 
    al.user_id = user_id OR
    (
      al.entity_type = 'project' AND 
      public.has_project_access(al.entity_id, user_id)
    ) OR
    (
      al.entity_type = 'organization' AND
      EXISTS (
        SELECT 1 FROM public.users usr 
        WHERE usr.id = user_id AND usr.organization_id = al.entity_id
      )
    ) OR
    public.is_admin(user_id)
  ORDER BY al.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.get_user_projects(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_projects(TEXT, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity_feed(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_organization_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_project_access(UUID, UUID) TO authenticated;

-- Grant select permissions on views
GRANT SELECT ON public.user_profiles_with_stats TO authenticated;
GRANT SELECT ON public.project_dashboard TO authenticated;
GRANT SELECT ON public.organization_members TO authenticated;
GRANT SELECT ON public.recent_activity TO authenticated;