/*
  # Fix Users RLS Policy

  1. Security Changes
    - Remove the problematic `users_insert_blocked` policy that prevents user profile creation
    - Keep other necessary RLS policies intact
    - Ensure the trigger function can properly create user profiles during signup

  This migration fixes the signup/login failures by allowing the `handle_new_user` trigger function
  to successfully create user profiles in the public.users table.
*/

-- Remove the problematic RLS policy that blocks user profile creation
DROP POLICY IF EXISTS "users_insert_blocked" ON public.users;

-- Ensure the service_role can insert users (for the trigger function)
CREATE POLICY IF NOT EXISTS "users_insert_service_role"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Verify other essential policies exist
DO $$
BEGIN
  -- Ensure users can read their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_select_own'
  ) THEN
    CREATE POLICY "users_select_own"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Ensure users can update their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_update_own'
  ) THEN
    CREATE POLICY "users_update_own"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Ensure admins can access all user data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_select_admin'
  ) THEN
    CREATE POLICY "users_select_admin"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (
        (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text
        OR auth.uid() = id
      );
  END IF;

  -- Ensure admins can update user data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_update_admin'
  ) THEN
    CREATE POLICY "users_update_admin"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (
        (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text
        OR auth.uid() = id
      );
  END IF;

  -- Ensure admins can delete users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_delete_admin'
  ) THEN
    CREATE POLICY "users_delete_admin"
      ON public.users
      FOR DELETE
      TO authenticated
      USING ((((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'ADMIN'::text);
  END IF;
END $$;