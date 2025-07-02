/*
  # Fix RLS Infinite Recursion

  1. Security Policy Updates
    - Remove recursive policies that cause infinite loops
    - Simplify admin checks to use auth.jwt() claims instead of table lookups
    - Ensure policies use direct auth.uid() comparisons where possible

  2. Changes Made
    - Replace is_admin() function calls with direct role checks from JWT
    - Simplify user policies to prevent recursion
    - Update related policies that might cause cascading issues
*/

-- First, drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;
DROP POLICY IF EXISTS "users_insert_blocked" ON users;
DROP POLICY IF EXISTS "users_insert_service_role" ON users;

-- Create simplified, non-recursive policies for users table
-- Allow users to read their own profile
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert users (for auth webhook)
CREATE POLICY "users_insert_service_role"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Block regular authenticated users from inserting directly
CREATE POLICY "users_insert_blocked"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Admin policies using JWT claims instead of table lookups
-- Allow admin users to read all profiles (using JWT role claim)
CREATE POLICY "users_select_admin"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
    OR 
    auth.uid() = id
  );

-- Allow admin users to update any profile (using JWT role claim)
CREATE POLICY "users_update_admin"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
    OR 
    auth.uid() = id
  );

-- Allow admin users to delete profiles (using JWT role claim)
CREATE POLICY "users_delete_admin"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Update other table policies that might be causing issues
-- Fix projects policies to avoid recursion
DROP POLICY IF EXISTS "projects_select_accessible" ON projects;
DROP POLICY IF EXISTS "projects_update_owner_or_admin" ON projects;
DROP POLICY IF EXISTS "projects_delete_owner_or_admin" ON projects;
DROP POLICY IF EXISTS "projects_insert_authenticated" ON projects;

-- Recreate projects policies without recursive functions
CREATE POLICY "projects_select_accessible"
  ON projects
  FOR SELECT
  TO public
  USING (
    owner_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "projects_insert_authenticated"
  ON projects
  FOR INSERT
  TO public
  WITH CHECK (
    auth.role() = 'authenticated'
    AND owner_id = auth.uid()
  );

CREATE POLICY "projects_update_owner_or_admin"
  ON projects
  FOR UPDATE
  TO public
  USING (
    owner_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "projects_delete_owner_or_admin"
  ON projects
  FOR DELETE
  TO public
  USING (
    owner_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Fix tasks policies
DROP POLICY IF EXISTS "tasks_select_project_access" ON tasks;
DROP POLICY IF EXISTS "tasks_update_assignee_creator_owner_admin" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_owner_or_admin" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_project_access" ON tasks;

-- Recreate tasks policies without recursive functions
CREATE POLICY "tasks_select_project_access"
  ON tasks
  FOR SELECT
  TO public
  USING (
    assigned_to_id = auth.uid()
    OR 
    created_by_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
    OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = tasks.project_id 
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "tasks_insert_project_access"
  ON tasks
  FOR INSERT
  TO public
  WITH CHECK (
    auth.role() = 'authenticated'
    AND created_by_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = tasks.project_id 
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "tasks_update_assignee_creator_owner_admin"
  ON tasks
  FOR UPDATE
  TO public
  USING (
    assigned_to_id = auth.uid()
    OR 
    created_by_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
    OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = tasks.project_id 
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "tasks_delete_owner_or_admin"
  ON tasks
  FOR DELETE
  TO public
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
    OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = tasks.project_id 
      AND p.owner_id = auth.uid()
    )
  );

-- Fix organizations policies
DROP POLICY IF EXISTS "organizations_select_member_or_owner" ON organizations;
DROP POLICY IF EXISTS "organizations_update_owner_or_admin" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_owner_or_admin" ON organizations;

CREATE POLICY "organizations_select_member_or_owner"
  ON organizations
  FOR SELECT
  TO public
  USING (
    owner_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
    OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.organization_id = organizations.id
    )
  );

CREATE POLICY "organizations_update_owner_or_admin"
  ON organizations
  FOR UPDATE
  TO public
  USING (
    owner_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

CREATE POLICY "organizations_delete_owner_or_admin"
  ON organizations
  FOR DELETE
  TO public
  USING (
    owner_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );

-- Fix activity_logs policies
DROP POLICY IF EXISTS "activity_logs_select_own_or_admin" ON activity_logs;

CREATE POLICY "activity_logs_select_own_or_admin"
  ON activity_logs
  FOR SELECT
  TO public
  USING (
    user_id = auth.uid()
    OR 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'ADMIN'
  );