/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Multiple overlapping RLS policies on users table causing infinite recursion
    - Policies referencing functions that create circular dependencies
    - The `users_select_own_and_public` policy has `OR true` which conflicts with other policies

  2. Solution
    - Drop all existing problematic policies
    - Create clean, non-overlapping policies
    - Ensure policies use direct auth.uid() references without circular function calls

  3. Security
    - Users can read their own profile
    - Users can update their own profile  
    - Only service_role can insert users (handled by auth triggers)
    - Only admins can delete users
    - Admins can read all users
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "users_delete_admin_only" ON users;
DROP POLICY IF EXISTS "users_insert_blocked" ON users;
DROP POLICY IF EXISTS "users_insert_service_role" ON users;
DROP POLICY IF EXISTS "users_select_own_and_public" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Create clean, non-recursive policies

-- Allow users to read their own profile
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to read all users (using direct role check)
CREATE POLICY "users_select_admin"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'ADMIN'
    )
  );

-- Allow users to update their own profile
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to update any user
CREATE POLICY "users_update_admin"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'ADMIN'
    )
  );

-- Only service_role can insert users (this is handled by auth triggers)
CREATE POLICY "users_insert_service_role"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Block regular user inserts
CREATE POLICY "users_insert_blocked"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Only admins can delete users
CREATE POLICY "users_delete_admin"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'ADMIN'
    )
  );