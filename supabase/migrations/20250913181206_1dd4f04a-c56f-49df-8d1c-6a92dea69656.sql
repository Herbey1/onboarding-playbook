-- Fix infinite recursion in RLS policies and add missing foreign keys

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Project owners can add members" ON project_members;
DROP POLICY IF EXISTS "Users can view project members if they are members" ON project_members;
DROP POLICY IF EXISTS "Admins can manage project members" ON project_members;

-- Add missing foreign keys
ALTER TABLE project_members 
ADD CONSTRAINT fk_project_members_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE project_members 
ADD CONSTRAINT fk_project_members_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE project_members 
ADD CONSTRAINT fk_project_members_invited_by 
FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE projects 
ADD CONSTRAINT fk_projects_owner_id 
FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_is_project_member(_project_id uuid, _user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_id = _project_id AND user_id = _user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_is_project_owner(_project_id uuid, _user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects 
        WHERE id = _project_id AND owner_id = _user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Recreate project_members policies with security definer functions
CREATE POLICY "Project owners and admins can manage members" ON project_members
FOR ALL USING (
    user_is_project_owner(project_id, auth.uid()) OR 
    is_project_admin(project_id, auth.uid())
)
WITH CHECK (
    user_is_project_owner(project_id, auth.uid()) OR 
    is_project_admin(project_id, auth.uid())
);

CREATE POLICY "Members can view project members" ON project_members
FOR SELECT USING (
    user_is_project_member(project_id, auth.uid()) OR
    user_is_project_owner(project_id, auth.uid())
);

CREATE POLICY "Users can leave projects" ON project_members
FOR DELETE USING (user_id = auth.uid());

-- Create trigger to automatically add project owner as member
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO project_members (project_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW())
    ON CONFLICT (project_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_add_owner_as_member
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION add_owner_as_member();

-- Ensure unique constraint on project_members
ALTER TABLE project_members 
ADD CONSTRAINT unique_project_user 
UNIQUE (project_id, user_id);