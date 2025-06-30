/*
  # Seed Data for Development and Testing

  1. Test Data
    - Sample organizations
    - Sample users (linked to auth.users)
    - Sample projects
    - Sample tasks
    - Sample comments

  2. Admin User
    - Create default admin user for testing
    - Set up proper permissions and roles

  Note: This is for development/testing only. Remove or modify for production.
*/

-- Insert sample organizations (only if they don't exist)
INSERT INTO public.organizations (id, name, description, owner_id, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Acme Corporation',
  'A leading technology company focused on innovative solutions',
  NULL, -- Will be updated when we create users
  'ACTIVE',
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.organizations WHERE name = 'Acme Corporation');

INSERT INTO public.organizations (id, name, description, owner_id, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'StartupHub',
  'Incubator and accelerator for early-stage startups',
  NULL, -- Will be updated when we create users
  'ACTIVE',
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.organizations WHERE name = 'StartupHub');

-- Note: Users will be created automatically via the handle_new_user trigger
-- when they sign up through Supabase Auth. The following is just for reference:

/*
Example of how users would be created through the auth system:

1. User signs up via Supabase Auth with metadata:
   {
     "first_name": "John",
     "last_name": "Doe", 
     "role": "ENTREPRENEUR"
   }

2. The handle_new_user trigger automatically creates a corresponding entry in public.users

3. Admin can then update organization associations and other details
*/

-- Create some sample projects (these will need real user IDs from auth.users)
-- This is commented out as it requires actual authenticated users

/*
-- Sample projects (uncomment and modify with real user IDs after users are created)
INSERT INTO public.projects (id, name, description, owner_id, organization_id, status, start_date, end_date, budget, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'Mobile App Development',
    'Develop a cross-platform mobile application for customer engagement',
    'USER_ID_HERE', -- Replace with actual user ID
    (SELECT id FROM public.organizations WHERE name = 'Acme Corporation' LIMIT 1),
    'ACTIVE',
    '2024-01-01',
    '2024-06-30',
    50000.00,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Website Redesign',
    'Complete overhaul of company website with modern design and improved UX',
    'USER_ID_HERE', -- Replace with actual user ID
    (SELECT id FROM public.organizations WHERE name = 'StartupHub' LIMIT 1),
    'PLANNING',
    '2024-02-01',
    '2024-04-30',
    25000.00,
    now(),
    now()
  );
*/

-- Create indexes for better performance on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON public.users(lower(email));
CREATE INDEX IF NOT EXISTS idx_projects_name_search ON public.projects USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_projects_description_search ON public.projects USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON public.tasks USING gin(to_tsvector('english', title));

-- Create a function to set up a user as admin (for development)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_found BOOLEAN := FALSE;
BEGIN
  UPDATE public.users 
  SET role = 'ADMIN'
  WHERE email = user_email;
  
  GET DIAGNOSTICS user_found = FOUND;
  
  IF user_found THEN
    -- Log the admin creation
    INSERT INTO public.activity_logs (user_id, action, details, created_at)
    SELECT 
      id,
      'ADMIN_ROLE_GRANTED',
      jsonb_build_object('granted_by', 'system', 'email', user_email),
      now()
    FROM public.users 
    WHERE email = user_email;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on admin function
GRANT EXECUTE ON FUNCTION public.make_user_admin(TEXT) TO authenticated;

-- Create a function to initialize sample data for a user (for development)
CREATE OR REPLACE FUNCTION public.create_sample_data_for_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  org_id UUID;
  project_id UUID;
  task_id UUID;
BEGIN
  -- Create a sample organization
  INSERT INTO public.organizations (name, description, owner_id, status)
  VALUES (
    'Sample Organization',
    'A sample organization for testing and development',
    user_id,
    'ACTIVE'
  )
  RETURNING id INTO org_id;
  
  -- Update user to be part of this organization
  UPDATE public.users 
  SET organization_id = org_id
  WHERE id = user_id;
  
  -- Create a sample project
  INSERT INTO public.projects (name, description, owner_id, organization_id, status, budget)
  VALUES (
    'Sample Project',
    'A sample project for testing the application features',
    user_id,
    org_id,
    'ACTIVE',
    10000.00
  )
  RETURNING id INTO project_id;
  
  -- Create sample tasks
  INSERT INTO public.tasks (project_id, created_by_id, assigned_to_id, title, description, status, priority, due_date)
  VALUES 
    (
      project_id,
      user_id,
      user_id,
      'Setup Project Structure',
      'Initialize the project structure and basic configuration',
      'DONE',
      'HIGH',
      now() + interval '1 day'
    ),
    (
      project_id,
      user_id,
      user_id,
      'Design User Interface',
      'Create wireframes and mockups for the user interface',
      'IN_PROGRESS',
      'MEDIUM',
      now() + interval '1 week'
    ),
    (
      project_id,
      user_id,
      user_id,
      'Implement Backend API',
      'Develop the backend API endpoints and database integration',
      'TODO',
      'HIGH',
      now() + interval '2 weeks'
    );
  
  -- Create a sample comment
  INSERT INTO public.comments (user_id, entity_type, entity_id, content)
  VALUES (
    user_id,
    'project',
    project_id,
    'This is a sample comment on the project. Great progress so far!'
  );
  
  -- Log the sample data creation
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    user_id,
    'SAMPLE_DATA_CREATED',
    'organization',
    org_id,
    jsonb_build_object(
      'organization_id', org_id,
      'project_id', project_id,
      'created_by', 'system'
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on sample data function
GRANT EXECUTE ON FUNCTION public.create_sample_data_for_user(UUID) TO authenticated;