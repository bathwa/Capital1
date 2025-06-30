/*
  # Real-time Subscriptions Setup

  1. Publications
    - Enable real-time for relevant tables
    - Configure publication settings

  2. Real-time Configuration
    - Set up table-level real-time subscriptions
    - Configure filters and security
*/

-- Enable real-time for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;

-- Note: Real-time subscriptions will respect RLS policies automatically
-- Clients will only receive updates for data they have access to

-- Create a function to notify clients of important events
CREATE OR REPLACE FUNCTION public.notify_project_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify about project status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM pg_notify(
      'project_status_changed',
      json_build_object(
        'project_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'updated_by', auth.uid()
      )::text
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to notify about task completions
CREATE OR REPLACE FUNCTION public.notify_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when task is completed
  IF TG_OP = 'UPDATE' AND OLD.status != 'DONE' AND NEW.status = 'DONE' THEN
    PERFORM pg_notify(
      'task_completed',
      json_build_object(
        'task_id', NEW.id,
        'project_id', NEW.project_id,
        'completed_by', auth.uid(),
        'task_title', NEW.title
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for notifications
CREATE TRIGGER notify_project_update_trigger
  AFTER UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.notify_project_update();

CREATE TRIGGER notify_task_completion_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_task_completion();

-- Create a function to get real-time channel name for a user
CREATE OR REPLACE FUNCTION public.get_user_channel(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
  RETURN 'user_' || user_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get real-time channel name for a project
CREATE OR REPLACE FUNCTION public.get_project_channel(project_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN 'project_' || project_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get real-time channel name for an organization
CREATE OR REPLACE FUNCTION public.get_organization_channel(org_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN 'organization_' || org_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_channel(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_channel(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_organization_channel(UUID) TO authenticated;