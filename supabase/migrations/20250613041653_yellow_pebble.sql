/*
  # Project Management Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `owner_id` (uuid, references profiles.id)
      - `status` (enum: active, archived, planning)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `project_members`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects.id)
      - `user_id` (uuid, references profiles.id)
      - `role` (enum: owner, admin, developer, viewer)
      - `invited_by` (uuid, references profiles.id)
      - `joined_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for project access control
    - Add policies for member management
    - Ensure users can only access projects they're members of

  3. Indexes
    - Add performance indexes for common queries
    - Composite indexes for filtering and sorting
</*/

-- Create enum types
CREATE TYPE project_status AS ENUM ('active', 'archived', 'planning');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'developer', 'viewer');

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT DEFAULT '',
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status project_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role member_role DEFAULT 'developer',
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_role ON public.project_members(role);

-- Projects policies
CREATE POLICY "Users can view projects they are members of"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners and admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = projects.id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('admin')
    )
  );

CREATE POLICY "Project owners can delete projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Project members policies
CREATE POLICY "Users can view project members for projects they belong to"
  ON public.project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners and admins can add members"
  ON public.project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id 
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid() 
          AND pm.role IN ('admin')
        )
      )
    )
  );

CREATE POLICY "Project owners and admins can update member roles"
  ON public.project_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id 
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid() 
          AND pm.role IN ('admin')
        )
      )
    )
  );

CREATE POLICY "Project owners and admins can remove members"
  ON public.project_members FOR DELETE
  USING (
    user_id = auth.uid() OR -- Users can remove themselves
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id 
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid() 
          AND pm.role IN ('admin')
        )
      )
    )
  );

-- Function to automatically add project owner as member
CREATE OR REPLACE FUNCTION public.add_project_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add owner as member when project is created
DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.add_project_owner_as_member();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();