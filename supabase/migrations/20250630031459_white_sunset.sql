/*
  # Storage Buckets and Policies

  1. Storage Buckets
    - profile_pictures: User profile images
    - project_files: Project-related documents
    - task_attachments: Task-related files
    - organization_assets: Organization logos and documents

  2. Storage Policies
    - Users can upload to their own folders
    - Organization members can access organization files
    - Project members can access project files
    - Public read access for profile pictures
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile_pictures', 'profile_pictures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('project_files', 'project_files', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain']),
  ('task_attachments', 'task_attachments', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain', 'application/zip']),
  ('organization_assets', 'organization_assets', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Profile Pictures Policies
-- Anyone can view profile pictures (public bucket)
CREATE POLICY "profile_pictures_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile_pictures');

-- Users can upload to their own profile folder
CREATE POLICY "profile_pictures_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile_pictures' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own profile pictures
CREATE POLICY "profile_pictures_user_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile_pictures' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own profile pictures
CREATE POLICY "profile_pictures_user_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile_pictures' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Project Files Policies
-- Users can view project files if they have project access
CREATE POLICY "project_files_read_access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project_files' AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id::text = (storage.foldername(name))[1]
        AND public.has_project_access(p.id)
      )
    )
  );

-- Users can upload project files if they have project access
CREATE POLICY "project_files_upload_access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project_files' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
      AND public.has_project_access(p.id)
    )
  );

-- Users can update project files if they have project access
CREATE POLICY "project_files_update_access" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project_files' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
      AND public.has_project_access(p.id)
    )
  );

-- Users can delete project files if they have project access
CREATE POLICY "project_files_delete_access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project_files' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[1]
      AND public.has_project_access(p.id)
    )
  );

-- Task Attachments Policies
-- Users can view task attachments if they have project access
CREATE POLICY "task_attachments_read_access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task_attachments' AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id::text = (storage.foldername(name))[1]
        AND public.has_project_access(t.project_id)
      )
    )
  );

-- Users can upload task attachments if they have project access
CREATE POLICY "task_attachments_upload_access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task_attachments' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id::text = (storage.foldername(name))[1]
      AND public.has_project_access(t.project_id)
    )
  );

-- Users can update task attachments if they have project access
CREATE POLICY "task_attachments_update_access" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'task_attachments' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id::text = (storage.foldername(name))[1]
      AND public.has_project_access(t.project_id)
    )
  );

-- Users can delete task attachments if they have project access
CREATE POLICY "task_attachments_delete_access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'task_attachments' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id::text = (storage.foldername(name))[1]
      AND public.has_project_access(t.project_id)
    )
  );

-- Organization Assets Policies
-- Organization members can view organization assets
CREATE POLICY "organization_assets_read_access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'organization_assets' AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id::text = (storage.foldername(name))[1]
        AND public.is_organization_member(o.id)
      )
    )
  );

-- Organization members can upload organization assets
CREATE POLICY "organization_assets_upload_access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'organization_assets' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id::text = (storage.foldername(name))[1]
      AND public.is_organization_member(o.id)
    )
  );

-- Organization owners and admins can update organization assets
CREATE POLICY "organization_assets_update_access" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'organization_assets' AND
    auth.role() = 'authenticated' AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id::text = (storage.foldername(name))[1]
        AND o.owner_id = auth.uid()
      )
    )
  );

-- Organization owners and admins can delete organization assets
CREATE POLICY "organization_assets_delete_access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'organization_assets' AND
    auth.role() = 'authenticated' AND
    (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id::text = (storage.foldername(name))[1]
        AND o.owner_id = auth.uid()
      )
    )
  );