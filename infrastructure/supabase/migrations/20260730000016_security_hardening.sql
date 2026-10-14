-- Migration 016: security hardening (applied to project pdoznhmckwovmrerlcro)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT SET search_path = '' AS
$$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;
