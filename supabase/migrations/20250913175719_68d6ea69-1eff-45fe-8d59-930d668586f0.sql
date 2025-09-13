-- Add invite codes table for project invitations
CREATE TABLE IF NOT EXISTS public.project_invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  role project_role NOT NULL DEFAULT 'member',
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  uses_left INTEGER DEFAULT NULL, -- NULL means unlimited uses
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_invite_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for invite codes
CREATE POLICY "Project admins can manage invite codes" 
ON public.project_invite_codes 
FOR ALL 
USING (is_project_admin(project_id, auth.uid()));

CREATE POLICY "Anyone can view active invite codes for joining" 
ON public.project_invite_codes 
FOR SELECT 
USING (expires_at > now() AND (uses_left IS NULL OR uses_left > 0));

-- Create index for faster lookups
CREATE INDEX idx_project_invite_codes_code ON public.project_invite_codes(code);
CREATE INDEX idx_project_invite_codes_project_id ON public.project_invite_codes(project_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_project_invite_codes_updated_at
BEFORE UPDATE ON public.project_invite_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();