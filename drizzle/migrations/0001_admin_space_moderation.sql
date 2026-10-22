ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = 'admin'
  )
$$;

CREATE POLICY "admin reads all spaces"
ON public.spaces
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "admin updates spaces"
ON public.spaces
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.guard_space_publication()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' AND NEW.publicado THEN
      RAISE EXCEPTION 'Only an administrator can publish a space';
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.publicado IS DISTINCT FROM NEW.publicado THEN
      RAISE EXCEPTION 'Only an administrator can change space publication status';
    END IF;
  END IF;

  RETURN NEW;
END
$$;

CREATE TRIGGER guard_space_publication_insert
BEFORE INSERT ON public.spaces
FOR EACH ROW
EXECUTE FUNCTION public.guard_space_publication();

CREATE TRIGGER guard_space_publication_update
BEFORE UPDATE OF publicado ON public.spaces
FOR EACH ROW
EXECUTE FUNCTION public.guard_space_publication();
