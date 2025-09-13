-- Fix RLS recursion issues in course tables and project members

-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Project admins can manage topics" ON course_topics;
DROP POLICY IF EXISTS "Users can view topics of projects they are members of" ON course_topics;
DROP POLICY IF EXISTS "Project admins can manage summaries" ON course_summaries;
DROP POLICY IF EXISTS "Users can view summaries of projects they are members of" ON course_summaries;
DROP POLICY IF EXISTS "Project admins can manage quizzes" ON course_quizzes;
DROP POLICY IF EXISTS "Users can view quizzes of projects they are members of" ON course_quizzes;

-- Create simplified RLS policies for course tables that use direct membership checks
CREATE POLICY "Users can manage topics of projects they own or admin" 
ON course_topics FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = course_topics.project_id 
    AND p.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = course_topics.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can view topics of projects they are members of" 
ON course_topics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = course_topics.project_id 
    AND p.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = course_topics.project_id 
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage summaries of projects they own or admin" 
ON course_summaries FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = course_summaries.topic_id 
    AND p.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_summaries.topic_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can view summaries of projects they are members of" 
ON course_summaries FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = course_summaries.topic_id 
    AND p.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_summaries.topic_id 
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage quizzes of projects they own or admin" 
ON course_quizzes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = course_quizzes.topic_id 
    AND p.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_quizzes.topic_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can view quizzes of projects they are members of" 
ON course_quizzes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN projects p ON ct.project_id = p.id
    WHERE ct.id = course_quizzes.topic_id 
    AND p.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM course_topics ct
    JOIN project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_quizzes.topic_id 
    AND pm.user_id = auth.uid()
  )
);