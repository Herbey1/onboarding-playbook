-- Fix project queries to work properly with RLS
-- First, let's make sure we have the correct RLS policy for projects that includes member access

-- Drop existing policy and recreate with better logic
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;

CREATE POLICY "Users can view projects they are members of" ON public.projects
FOR SELECT USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

-- Ensure project members can be inserted properly
DROP POLICY IF EXISTS "Project owners can add members" ON public.project_members;
CREATE POLICY "Project owners can add members" ON public.project_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_id 
    AND projects.owner_id = auth.uid()
  )
  OR
  is_project_admin(project_id, auth.uid())
);

-- Fix the project members viewing policy
DROP POLICY IF EXISTS "Users can view project members if they are members" ON public.project_members;
CREATE POLICY "Users can view project members if they are members" ON public.project_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm2 
    WHERE pm2.project_id = project_members.project_id 
    AND pm2.user_id = auth.uid()
  )
);

-- Add policy for project invite codes to be used by authenticated users
CREATE POLICY IF NOT EXISTS "Authenticated users can view valid invite codes" 
ON public.project_invite_codes 
FOR SELECT 
TO authenticated
USING (expires_at > now() AND (uses_left IS NULL OR uses_left > 0));