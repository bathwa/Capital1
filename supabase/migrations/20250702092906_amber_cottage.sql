/*
  # Initial Schema Setup for Abathwa Capital

  1. New Tables
    - `users` - Extended user profiles linked to auth.users
  
  2. Security
    - Enable RLS on users table
    - Add policies for user access control
  
  3. Functions & Triggers
    - Auto-create user profiles on signup
    - Handle email confirmation status updates
    - Auto-update timestamps
  
  4. Indexes
    - Performance indexes on commonly queried fields
  
  5. Seed Data
    - Initial admin user
*/

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_email_confirmation();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Create users table that extends auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'ENTREPRENEUR', 'INVESTOR', 'SERVICE_PROVIDER', 'OBSERVER')) DEFAULT 'ENTREPRENEUR',
    status TEXT NOT NULL CHECK (status IN ('PENDING_EMAIL_CONFIRMATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED')) DEFAULT 'PENDING_EMAIL_CONFIRMATION',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    organization_id UUID,
    profile_picture_url TEXT,
    profile_completion_percentage INTEGER DEFAULT 20 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
    reliability_score INTEGER DEFAULT 0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    last_login TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;

-- Create policies for RLS
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        phone_number,
        role,
        status
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', NULL),
        COALESCE(NEW.raw_user_meta_data->>'role', 'ENTREPRENEUR'),
        CASE 
            WHEN NEW.email_confirmed_at IS NOT NULL THEN 'ACTIVE'
            ELSE 'PENDING_EMAIL_CONFIRMATION'
        END
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, skip insertion
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error and continue
        RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function after user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user status when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
        UPDATE public.users 
        SET status = 'ACTIVE', updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and continue
        RAISE WARNING 'Error updating user status for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email confirmation
CREATE TRIGGER on_auth_user_email_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmation();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Insert seed admin user (only if it doesn't exist)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@abathwa.com';
    
    IF admin_user_id IS NULL THEN
        -- Create admin user in auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'admin@abathwa.com',
            crypt('AdminPassword123!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"first_name": "Admin", "last_name": "User", "role": "ADMIN"}'::jsonb,
            'authenticated',
            'authenticated'
        );
    END IF;
END $$;