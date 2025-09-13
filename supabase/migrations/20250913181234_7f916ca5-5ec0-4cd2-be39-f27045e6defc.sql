-- Fix infinite recursion in RLS policies - Complete reset

-- Drop ALL existing policies on project_members
DROP POLICY IF EXISTS "Project owners can add members" ON project_members;
DROP POLICY IF EXISTS "Users can view project members if they are members" ON project_members;
DROP POLICY IF EXISTS "Admins can manage project members" ON project_members;
DROP POLICY IF EXISTS "Users can leave projects" ON project_members;
DROP POLICY IF EXISTS "Project owners and admins can manage members" ON project_members;
DROP POLICY IF EXISTS "Members can view project members" ON project_members;

-- Add missing foreign keys (skip if already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_project_members_user_id') THEN
        ALTER TABLE project_members 
        ADD CONSTRAINT fk_project_members_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_project_members_project_id') THEN
        ALTER TABLE project_members 
        ADD CONSTRAINT fk_project_members_project_id 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_project_user') THEN
        ALTER TABLE project_members 
        ADD CONSTRAINT unique_project_user 
        UNIQUE (project_id, user_id);
    END IF;
END $$;

-- Create new simplified policies
CREATE POLICY "Members can view other members" ON project_members
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM project_members pm2 
        WHERE pm2.project_id = project_members.project_id 
        AND pm2.user_id = auth.uid()
    )
);

CREATE POLICY "Project owners can manage members" ON project_members
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = project_members.project_id 
        AND p.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can leave projects themselves" ON project_members
FOR DELETE USING (user_id = auth.uid());

-- Create trigger to add owner as member when project is created
CREATE OR REPLACE FUNCTION public.add_project_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO project_members (project_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', now())
    ON CONFLICT (project_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_add_owner_as_member ON projects;
CREATE TRIGGER trigger_add_owner_as_member
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION add_project_owner_as_member();