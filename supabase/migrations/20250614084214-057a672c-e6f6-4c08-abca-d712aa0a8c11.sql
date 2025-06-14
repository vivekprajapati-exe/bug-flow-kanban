
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Add organization_id to projects table
ALTER TABLE public.projects ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to tickets table  
ALTER TABLE public.tickets ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create user roles table for fine-grained permissions
CREATE TYPE public.app_permission AS ENUM (
  'create_projects', 
  'manage_projects', 
  'delete_projects',
  'create_tickets',
  'manage_tickets', 
  'delete_tickets',
  'manage_organization',
  'invite_members'
);

CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  permission app_permission NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id, permission)
);

-- Create security definer functions for permission checking
CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id UUID, _org_id UUID, _permission app_permission)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = _user_id 
    AND organization_id = _org_id 
    AND permission = _permission
  ) OR EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE user_id = _user_id 
    AND organization_id = _org_id 
    AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE user_id = _user_id 
    AND organization_id = _org_id
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizations
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations FOR SELECT
  USING (public.user_belongs_to_organization(auth.uid(), id));

CREATE POLICY "Organization owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE user_id = auth.uid() 
      AND organization_id = id 
      AND role = 'owner'
    )
  );

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS policies for organization members
CREATE POLICY "Users can view members of their organizations"
  ON public.organization_members FOR SELECT
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Organization admins can manage members"
  ON public.organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id 
      AND om.role IN ('owner', 'admin')
    )
  );

-- RLS policies for user permissions
CREATE POLICY "Users can view permissions in their organizations"
  ON public.user_permissions FOR SELECT
  USING (public.user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Organization owners can manage permissions"
  ON public.user_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE user_id = auth.uid() 
      AND organization_id = user_permissions.organization_id 
      AND role = 'owner'
    )
  );

-- Update projects RLS policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view organization projects"
  ON public.projects FOR SELECT
  USING (
    CASE 
      WHEN organization_id IS NOT NULL THEN 
        public.user_belongs_to_organization(auth.uid(), organization_id)
      ELSE 
        auth.uid() = owner_id
    END
  );

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects in their organizations"
  ON public.projects FOR INSERT
  WITH CHECK (
    CASE 
      WHEN organization_id IS NOT NULL THEN 
        public.user_has_permission(auth.uid(), organization_id, 'create_projects')
      ELSE 
        auth.uid() = owner_id
    END
  );

-- Update tickets RLS policies
DROP POLICY IF EXISTS "Users can view project tickets" ON public.tickets;
CREATE POLICY "Users can view organization tickets"
  ON public.tickets FOR SELECT
  USING (
    CASE 
      WHEN organization_id IS NOT NULL THEN 
        public.user_belongs_to_organization(auth.uid(), organization_id)
      ELSE 
        EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND p.owner_id = auth.uid()
        )
    END
  );

-- Create trigger to automatically assign permissions to organization owners
CREATE OR REPLACE FUNCTION public.assign_owner_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role = 'owner' THEN
    INSERT INTO public.user_permissions (user_id, organization_id, permission, granted_by)
    VALUES 
      (NEW.user_id, NEW.organization_id, 'create_projects', NEW.user_id),
      (NEW.user_id, NEW.organization_id, 'manage_projects', NEW.user_id),
      (NEW.user_id, NEW.organization_id, 'delete_projects', NEW.user_id),
      (NEW.user_id, NEW.organization_id, 'create_tickets', NEW.user_id),
      (NEW.user_id, NEW.organization_id, 'manage_tickets', NEW.user_id),
      (NEW.user_id, NEW.organization_id, 'delete_tickets', NEW.user_id),
      (NEW.user_id, NEW.organization_id, 'manage_organization', NEW.user_id),
      (NEW.user_id, NEW.organization_id, 'invite_members', NEW.user_id)
    ON CONFLICT (user_id, organization_id, permission) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_owner_permissions_trigger
  AFTER INSERT ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_owner_permissions();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
