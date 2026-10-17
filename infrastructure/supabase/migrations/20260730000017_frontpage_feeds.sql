-- ============================================================================
-- 17 · Front-page feeds (read-only public RPCs)
--
-- The homepage, /noticias and /clasificados read through these functions instead of
-- querying the `content` / `listings` schemas directly, so they work WITHOUT having to
-- add those schemas to "Exposed schemas" in the Supabase dashboard.
--
-- SECURITY INVOKER on purpose: the existing RLS policies (articles_public_read,
-- listings_public_read) decide what is visible — only published / active, not deleted,
-- not expired. These functions add NO extra access, they only shape the output.
-- Contact data of a classified is returned ONLY by classified_detail() (detail page).
-- ============================================================================

-- ── News list (home, /noticias, per category) ───────────────────────────────
create or replace function public.news_feed(
  p_category text default null,
  p_limit    int  default 12,
  p_offset   int  default 0
)
returns table (
  id uuid, slug text, title_es text, title_en text, excerpt_es text, excerpt_en text,
  featured_image text, category_slug text, category_name_es text, category_name_en text,
  source_type text, source_name text, source_url text,
  published_at timestamptz, is_featured boolean
)
language sql stable
set search_path = public, content
as $$
  select a.id, a.slug, a.title_es, a.title_en, a.excerpt_es, a.excerpt_en, a.featured_image,
         c.slug, c.name_es, c.name_en,
         a.source_type, a.source_name, a.source_url,
         coalesce(a.published_at, a.created_at), a.is_featured
  from content.articles a
  left join public.categories c on c.id = a.category_id
  where a.status = 'published'
    and a.deleted_at is null
    and (a.published_at is null or a.published_at <= now())
    and (p_category is null or c.slug = p_category)
  order by coalesce(a.published_at, a.created_at) desc
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

-- ── One article ─────────────────────────────────────────────────────────────
create or replace function public.news_article(p_slug text)
returns table (
  id uuid, slug text, title_es text, title_en text, excerpt_es text, excerpt_en text,
  content_es text, content_en text, featured_image text,
  category_slug text, category_name_es text, category_name_en text,
  source_type text, source_name text, source_url text,
  author_name text, published_at timestamptz, updated_at timestamptz,
  seo_title text, seo_description text
)
language sql stable
set search_path = public, content
as $$
  select a.id, a.slug, a.title_es, a.title_en, a.excerpt_es, a.excerpt_en,
         a.content_es, a.content_en, a.featured_image,
         c.slug, c.name_es, c.name_en,
         a.source_type, a.source_name, a.source_url,
         pr.display_name, coalesce(a.published_at, a.created_at), a.updated_at,
         a.seo_title, a.seo_description
  from content.articles a
  left join public.categories c on c.id = a.category_id
  left join public.profiles pr on pr.id = a.author_id
  where a.slug = p_slug
    and a.status = 'published'
    and a.deleted_at is null
  limit 1;
$$;

-- ── Classifieds list (home, /clasificados) — NO contact data here ───────────
create or replace function public.classifieds_feed(
  p_category text default null,
  p_query    text default null,
  p_limit    int  default 12,
  p_offset   int  default 0
)
returns table (
  id uuid, slug text, title text, price numeric, currency text,
  price_negotiable boolean, is_free boolean, neighborhood text, city text,
  category_slug text, category_name_es text, category_name_en text,
  photo_url text, created_at timestamptz
)
language sql stable
set search_path = public, listings
as $$
  select l.id, l.slug, l.title, l.price, l.currency, l.price_negotiable, l.is_free,
         l.neighborhood, l.city, c.slug, c.name_es, c.name_en,
         (select m.url from listings.listing_media m where m.listing_id = l.id order by m.sort_order limit 1),
         l.created_at
  from listings.listings l
  left join public.categories c on c.id = l.category_id
  where l.status = 'active'
    and l.deleted_at is null
    and (l.expires_at is null or l.expires_at > now())
    and (p_category is null or c.slug = p_category)
    and (
      p_query is null or p_query = ''
      or l.fts_es @@ websearch_to_tsquery('spanish', public.f_unaccent(p_query))
    )
  order by l.created_at desc
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

-- ── One classified (detail page: this is where contact info is meant to be public) ──
create or replace function public.classified_detail(p_slug text)
returns table (
  id uuid, slug text, title text, description text, price numeric, currency text,
  price_negotiable boolean, is_free boolean, neighborhood text, city text,
  category_slug text, category_name_es text, category_name_en text,
  contact_name text, contact_phone text, contact_whatsapp text, contact_email text,
  photos text[], created_at timestamptz, expires_at timestamptz
)
language sql stable
set search_path = public, listings
as $$
  select l.id, l.slug, l.title, l.description, l.price, l.currency, l.price_negotiable, l.is_free,
         l.neighborhood, l.city, c.slug, c.name_es, c.name_en,
         l.contact_name, l.contact_phone, l.contact_whatsapp, l.contact_email,
         coalesce((select array_agg(m.url order by m.sort_order) from listings.listing_media m where m.listing_id = l.id), '{}'),
         l.created_at, l.expires_at
  from listings.listings l
  left join public.categories c on c.id = l.category_id
  where l.slug = p_slug
    and l.status = 'active'
    and l.deleted_at is null
    and (l.expires_at is null or l.expires_at > now())
  limit 1;
$$;

revoke all on function public.news_feed(text, int, int)               from public;
revoke all on function public.news_article(text)                      from public;
revoke all on function public.classifieds_feed(text, text, int, int)  from public;
revoke all on function public.classified_detail(text)                 from public;
grant execute on function public.news_feed(text, int, int)               to anon, authenticated;
grant execute on function public.news_article(text)                      to anon, authenticated;
grant execute on function public.classifieds_feed(text, text, int, int)  to anon, authenticated;
grant execute on function public.classified_detail(text)                 to anon, authenticated;
