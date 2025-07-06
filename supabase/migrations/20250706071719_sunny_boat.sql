/*
  # Fix RLS policies for users table

  1. Remove blocking policy that prevents user creation
  2. Add proper policies for service_role to insert users
  3. Set up user access policies with correct JWT function
  4. Enable admin access with proper role checking

  This migration fixes the JWT function error by using auth.jwt() instead of jwt().
*/

-- Remove the problematic policy that blocks user profile creation
DROP POLICY IF EXISTS "users_insert_blocked" ON public.users;

-- Drop existing policies to recreate them (avoids conflicts)
DROP POLICY IF EXISTS "users_insert_service_role" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;

-- Allow service_role to insert users (for trigger functions and auth webhooks)
CREATE POLICY "users_insert_service_role"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to read all user data (and users to read their own)
CREATE POLICY "users_select_admin"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text
    OR auth.uid() = id
  );

-- Allow admins to update all user data (and users to update their own)
CREATE POLICY "users_update_admin"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text
    OR auth.uid() = id
  );

-- Allow admins to delete users
CREATE POLICY "users_delete_admin"
  ON public.users
  FOR DELETE
  TO authenticated
  USING ((((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text);