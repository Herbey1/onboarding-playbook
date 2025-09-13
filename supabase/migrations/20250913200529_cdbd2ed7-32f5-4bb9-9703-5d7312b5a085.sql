-- Fix missing project member and ensure triggers work correctly

-- Add the missing project owner as member for existing projects
INSERT INTO project_members (project_id, user_id, role, joined_at)
SELECT id, owner_id, 'owner', created_at
FROM projects
WHERE NOT EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = projects.owner_id
);

-- Test the trigger is working by checking it exists
SELECT 
    tgname as trigger_name,
    proname as function_name,
    tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.projects'::regclass
AND tgname = 'trigger_add_project_owner_as_member';