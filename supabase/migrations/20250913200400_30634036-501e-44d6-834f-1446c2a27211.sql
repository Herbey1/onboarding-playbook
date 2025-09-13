-- Fix infinite recursion in RLS policies

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete their projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_id = _project_id AND user_id = _user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_project_owner(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = _project_id AND owner_id = _user_id
    );
$$;

-- Recreate RLS policies using security definer functions
CREATE POLICY "Users can view projects they own or are members of" 
ON public.projects 
FOR SELECT 
USING (
    auth.uid() = owner_id OR 
    public.is_project_member(id, auth.uid())
);

CREATE POLICY "Authenticated users can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update their projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete their projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Update is_project_admin function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_project_admin(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = _project_id 
        AND pm.user_id = _user_id 
        AND pm.role IN ('owner', 'admin')
    ) OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = _project_id 
        AND p.owner_id = _user_id
    );
$$;

-- Make sure the trigger function exists for adding project owners as members
CREATE OR REPLACE FUNCTION public.add_project_owner_as_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO project_members (project_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', now())
    ON CONFLICT (project_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Create trigger to automatically add project owner as member
DROP TRIGGER IF EXISTS trigger_add_project_owner_as_member ON public.projects;
CREATE TRIGGER trigger_add_project_owner_as_member
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.add_project_owner_as_member();

-- Ensure project_members table has proper unique constraint
ALTER TABLE public.project_members 
ADD CONSTRAINT unique_project_user 
UNIQUE (project_id, user_id) 
ON CONFLICT DO NOTHING;