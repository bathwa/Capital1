/*
  # Enable Row Level Security

  1. Security
    - Enable RLS on all tables
    - Ensure data isolation and security
    - Prepare for policy creation
*/

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.comments TO authenticated;
GRANT ALL ON public.attachments TO authenticated;
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT INSERT ON public.activity_logs TO authenticated;

-- Grant sequence permissions for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.calculate_profile_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity(UUID, TEXT, entity_type, UUID, JSONB, JSONB, JSONB) TO authenticated;