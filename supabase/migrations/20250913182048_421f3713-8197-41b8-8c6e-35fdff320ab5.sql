-- Create course topics table
CREATE TABLE public.course_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create course summaries table
CREATE TABLE public.course_summaries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid NOT NULL REFERENCES public.course_topics(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create course quizzes table
CREATE TABLE public.course_quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid NOT NULL REFERENCES public.course_topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project documentation table
CREATE TABLE public.project_documentation (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  pr_template text,
  code_nomenclature text,
  gitflow_docs text,
  additional_docs text,
  file_attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable Row Level Security
ALTER TABLE public.course_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documentation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_topics
CREATE POLICY "Users can view topics of projects they are members of"
ON public.course_topics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = course_topics.project_id 
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project admins can manage topics"
ON public.course_topics FOR ALL
USING (is_project_admin(project_id, auth.uid()));

-- Create RLS policies for course_summaries
CREATE POLICY "Users can view summaries of projects they are members of"
ON public.course_summaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_topics ct
    JOIN public.project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_summaries.topic_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project admins can manage summaries"
ON public.course_summaries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.course_topics ct
    WHERE ct.id = course_summaries.topic_id
    AND is_project_admin(ct.project_id, auth.uid())
  )
);

-- Create RLS policies for course_quizzes
CREATE POLICY "Users can view quizzes of projects they are members of"
ON public.course_quizzes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_topics ct
    JOIN public.project_members pm ON ct.project_id = pm.project_id
    WHERE ct.id = course_quizzes.topic_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project admins can manage quizzes"
ON public.course_quizzes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.course_topics ct
    WHERE ct.id = course_quizzes.topic_id
    AND is_project_admin(ct.project_id, auth.uid())
  )
);

-- Create RLS policies for project_documentation
CREATE POLICY "Users can view documentation of projects they are members of"
ON public.project_documentation FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_documentation.project_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project admins can manage documentation"
ON public.project_documentation FOR ALL
USING (is_project_admin(project_id, auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_course_topics_updated_at
  BEFORE UPDATE ON public.course_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_summaries_updated_at
  BEFORE UPDATE ON public.course_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_quizzes_updated_at
  BEFORE UPDATE ON public.course_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_documentation_updated_at
  BEFORE UPDATE ON public.project_documentation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_course_topics_project_id ON public.course_topics(project_id);
CREATE INDEX idx_course_topics_order ON public.course_topics(project_id, order_index);
CREATE INDEX idx_course_summaries_topic_id ON public.course_summaries(topic_id);
CREATE INDEX idx_course_quizzes_topic_id ON public.course_quizzes(topic_id);
CREATE INDEX idx_project_documentation_project_id ON public.project_documentation(project_id);