-- Fix search_path security issues
CREATE OR REPLACE FUNCTION public.get_user_role_in_project(_project_id UUID, _user_id UUID)
RETURNS project_role AS $$
    SELECT role FROM public.project_members 
    WHERE project_id = _project_id AND user_id = _user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_project_admin(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.project_members pm
        JOIN public.projects p ON pm.project_id = p.id
        WHERE pm.project_id = _project_id 
        AND pm.user_id = _user_id 
        AND (pm.role IN ('owner', 'admin') OR p.owner_id = _user_id)
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;