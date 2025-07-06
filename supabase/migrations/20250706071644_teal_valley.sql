/*
  # Fix RLS policies for user profile creation

  1. Changes Made
    - Remove the problematic `users_insert_blocked` policy that prevents user creation
    - Add service_role policy to allow trigger functions to insert users
    - Recreate essential RLS policies using DROP/CREATE pattern

  2. Security
    - Maintains proper RLS security for user data access
    - Allows authenticated users to read/update their own data
    - Allows admins to manage all user data
    - Allows service_role to insert new user profiles
*/

-- Remove the problematic policy that blocks user profile creation
DROP POLICY IF EXISTS "users_insert_blocked" ON public.users;

-- Drop existing policies to recreate them (avoids IF NOT EXISTS issues)
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
    (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text
    OR auth.uid() = id
  );

-- Allow admins to update all user data (and users to update their own)
CREATE POLICY "users_update_admin"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text
    OR auth.uid() = id
  );

-- Allow admins to delete users
CREATE POLICY "users_delete_admin"
  ON public.users
  FOR DELETE
  TO authenticated
  USING ((((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text);