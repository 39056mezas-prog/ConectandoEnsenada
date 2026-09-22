'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function signInWithGoogle(next?: string) {
  const supabase = await createClient()
  const safeNext = next?.startsWith('/') ? next : '/'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${SITE_URL}/api/auth/callback?next=${encodeURIComponent(safeNext)}`, queryParams: { access_type: 'offline', prompt: 'consent' } },
  })
  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}

const MagicLinkSchema = z.object({ email: z.string().email('Correo electrónico inválido') })
export type MagicLinkState = { success?: boolean; sent?: boolean; error?: string; fieldError?: string }

export async function signInWithMagicLink(_prev: MagicLinkState, formData: FormData): Promise<MagicLinkState> {
  const parsed = MagicLinkSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { fieldError: parsed.error.issues[0]?.message ?? 'Email inválido' }
  const next = (formData.get('next') as string) ?? '/'
  const safeNext = next.startsWith('/') ? next : '/'
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${SITE_URL}/api/auth/confirm?next=${encodeURIComponent(safeNext)}`, shouldCreateUser: true },
  })
  if (error) {
    if (error.message.includes('rate limit')) return { error: 'Demasiados intentos. Espera un momento.' }
    return { error: 'No pudimos enviar el enlace. Intenta de nuevo.' }
  }
  return { sent: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

const ProfileSchema = z.object({
  display_name: z.string().min(2).max(80),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  preferred_lang: z.enum(['es', 'en']),
})
export type UpdateProfileState = { success?: boolean; error?: string; errors?: Partial<Record<string, string[]>> }

export async function updateProfile(_prev: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }
  const parsed = ProfileSchema.safeParse({
    display_name: formData.get('display_name'),
    bio: formData.get('bio') || undefined,
    phone: formData.get('phone') || undefined,
    preferred_lang: formData.get('preferred_lang') ?? 'es',
  })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('profiles').update({
    display_name: parsed.data.display_name,
    bio: parsed.data.bio ?? null,
    phone: parsed.data.phone ?? null,
    preferred_lang: parsed.data.preferred_lang,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)
  if (error) return { error: 'Error al guardar. Intenta de nuevo.' }
  revalidatePath('/perfil')
  return { success: true }
}
