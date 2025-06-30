/*
  # Database Functions and Triggers

  1. Functions
    - `set_updated_at()` - Automatically update updated_at timestamps
    - `handle_new_user()` - Create user profile when auth user is created
    - `log_activity()` - Log user activities for audit trail
    - `calculate_profile_completion()` - Calculate user profile completion percentage

  2. Triggers
    - Updated_at triggers for all tables
    - User creation trigger
    - Activity logging triggers
*/

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone_number,
    status,
    profile_completion_percentage,
    reliability_score,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'ENTREPRENEUR'),
    NEW.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN NEW.email_confirmed_at IS NOT NULL THEN 'ACTIVE'::user_status
      ELSE 'PENDING_EMAIL_CONFIRMATION'::user_status
    END,
    30, -- Initial profile completion
    0,  -- Initial reliability score
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  completion_score NUMERIC := 0;
  user_record RECORD;
BEGIN
  SELECT * INTO user_record FROM public.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Base score for having an account
  completion_score := 20;
  
  -- Email verification
  IF user_record.status != 'PENDING_EMAIL_CONFIRMATION' THEN
    completion_score := completion_score + 15;
  END IF;
  
  -- Profile picture
  IF user_record.profile_picture_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Phone number
  IF user_record.phone_number IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Organization membership
  IF user_record.organization_id IS NOT NULL THEN
    completion_score := completion_score + 15;
  END IF;
  
  -- First and last name completeness
  IF char_length(user_record.first_name) > 1 AND char_length(user_record.last_name) > 1 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Role-specific completions
  CASE user_record.role
    WHEN 'ENTREPRENEUR' THEN
      -- Check if user has created any projects
      IF EXISTS (SELECT 1 FROM public.projects WHERE owner_id = user_id) THEN
        completion_score := completion_score + 20;
      END IF;
    WHEN 'INVESTOR' THEN
      -- Check if user has investment preferences set
      IF user_record.preferences IS NOT NULL AND user_record.preferences != '{}' THEN
        completion_score := completion_score + 20;
      END IF;
    ELSE
      completion_score := completion_score + 20;
  END CASE;
  
  RETURN LEAST(completion_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type entity_type DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    details,
    created_at
  )
  VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_details,
    now()
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile completion when user data changes
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := public.calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_comments
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_attachments
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for profile completion calculation
CREATE TRIGGER update_profile_completion_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_completion();

-- Create trigger to set completed_at when task status changes to DONE
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completed_at when status changes to DONE
  IF NEW.status = 'DONE' AND OLD.status != 'DONE' THEN
    NEW.completed_at = now();
    NEW.progress_percentage = 100;
  END IF;
  
  -- Clear completed_at when status changes from DONE to something else
  IF NEW.status != 'DONE' AND OLD.status = 'DONE' THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_task_completion_trigger
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();

-- Create trigger to set edited_at when comment content changes
CREATE OR REPLACE FUNCTION public.handle_comment_edit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content != OLD.content THEN
    NEW.is_edited = TRUE;
    NEW.edited_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_comment_edit_trigger
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_edit();