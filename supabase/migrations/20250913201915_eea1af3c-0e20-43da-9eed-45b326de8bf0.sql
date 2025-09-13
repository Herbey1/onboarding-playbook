-- Fix RLS recursion issues by dropping all existing policies and creating new ones

-- Drop ALL existing policies for course tables
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies for course_topics
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'course_topics' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON course_topics';
    END LOOP;
    
    -- Drop all policies for course_summaries
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'course_summaries' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON course_summaries';
    END LOOP;
    
    -- Drop all policies for course_quizzes
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'course_quizzes' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON course_quizzes';
    END LOOP;
END $$;

-- Create simplified RLS policies for course_topics
CREATE POLICY "Project owners can manage topics" 
ON course_topics FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = course_topics.project_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Project admins can manage topics" 
ON course_topics FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = course_topics.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Project members can view topics" 
ON course_topics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = course_topics.project_id 
    AND pm.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = course_topics.project_id 
    AND p.owner_id = auth.uid()
  )
);

-- Create simplified RLS policies for course_summaries
CREATE POLICY "Project owners can manage summaries" 
ON course_summaries FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = course_summaries.topic_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Project admins can manage summaries" 
ON course_summaries FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_summaries.topic_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Project members can view summaries" 
ON course_summaries FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_summaries.topic_id 
    AND pm.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = course_summaries.topic_id 
    AND p.owner_id = auth.uid()
  )
);

-- Create simplified RLS policies for course_quizzes
CREATE POLICY "Project owners can manage quizzes" 
ON course_quizzes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = course_quizzes.topic_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Project admins can manage quizzes" 
ON course_quizzes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_quizzes.topic_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Project members can view quizzes" 
ON course_quizzes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_quizzes.topic_id 
    AND pm.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = course_quizzes.topic_id 
    AND p.owner_id = auth.uid()
  )
);