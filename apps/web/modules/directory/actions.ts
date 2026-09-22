'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

// ── Validation ────────────────────────────────────────────────────────────────
const SubmitPlaceSchema = z.object({
  place_type: z.enum([
    'business','restaurant','beach','trail',
    'park','attraction','organization','nature_spot','real_estate',
  ]),
  name_es:        z.string().min(2).max(120),
  category_id:    z.string().uuid().optional().or(z.literal('')),
  short_desc_es:  z.string().max(160).optional(),
  description_es: z.string().max(5000).optional(),
  address:        z.string().max(300).optional(),
  neighborhood:   z.string().max(100).optional(),
  phone:          z.string().max(20).optional(),
  whatsapp:       z.string().max(20).optional(),
  email:          z.string().email().optional().or(z.literal('')),
  website:        z.string().url().optional().or(z.literal('')),
  price_range:    z.enum(['$','$$','$$$','$$$$']).optional().or(z.literal('')),
  accepts_cards:  z.coerce.boolean().optional(),
  has_parking:    z.coerce.boolean().optional(),
  rfc:            z.string().max(13).optional(),
})

export type SubmitPlaceState = {
  success: boolean
  errors?: Partial<Record<string, string[]>>
  message?: string
  slug?: string
}

// ── submitPlace ───────────────────────────────────────────────────────────────
export async function submitPlace(
  _prevState: SubmitPlaceState,
  formData: FormData
): Promise<SubmitPlaceState> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, message: 'Debes iniciar sesión para agregar un lugar.' }
  }

  const raw    = Object.fromEntries(formData.entries())
  const parsed = SubmitPlaceSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      errors:  parsed.error.flatten().fieldErrors,
      message: 'Por favor corrige los errores antes de continuar.',
    }
  }

  const data = parsed.data
  // Use admin client to bypass RLS for schema-qualified inserts
  const admin = createAdminClient()

  // Generate unique slug
  let slug = slugify(data.name_es)
  for (let attempt = 0; attempt < 100; attempt++) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`
    const { data: existing } = await admin
      .from('directory.places')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!existing) { slug = candidate; break }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any

  const { data: place, error: insertError } = await adminAny
    .from('directory.places')
    .insert({
      owner_id:       user.id,
      place_type:     data.place_type,
      category_id:    data.category_id || null,
      name_es:        data.name_es,
      slug,
      short_desc_es:  data.short_desc_es  || null,
      description_es: data.description_es || null,
      address:        data.address        || null,
      neighborhood:   data.neighborhood   || null,
      phone:          data.phone          || null,
      whatsapp:       data.whatsapp       || null,
      email:          data.email          || null,
      website:        data.website        || null,
      status:         'pending',
    })
    .select('id, slug')
    .single()

  if (insertError || !place) {
    console.error('[submitPlace]', insertError?.message)
    return { success: false, message: 'Error al guardar. Intenta de nuevo.' }
  }

  const p = place as { id: string; slug: string }

  if (['business','restaurant'].includes(data.place_type)) {
    await adminAny.from('directory.business_details').insert({
      place_id:      p.id,
      rfc:           data.rfc           || null,
      price_range:   data.price_range   || null,
      accepts_cards: data.accepts_cards ?? null,
      has_parking:   data.has_parking   ?? null,
    })
  }

  revalidatePath('/negocios')
  return {
    success: true,
    slug:    p.slug,
    message: '¡Tu lugar fue enviado! Aparecerá en el directorio tras ser revisado por nuestro equipo.',
  }
}

// ── reportEntity ──────────────────────────────────────────────────────────────
export async function reportEntity(
  entityType: string,
  entityId:   string,
  reason:     string,
  description?: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('moderation.reports').insert({
    reporter_id: user?.id ?? null,
    entity_type: entityType,
    entity_id:   entityId,
    reason,
    description: description ?? null,
  })

  return { success: true, message: 'Reporte enviado. Gracias por ayudarnos a mejorar la plataforma.' }
}
