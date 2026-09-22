'use server'
export type ContactState = { success?: boolean; error?: string } | null
export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name    = formData.get('name')    as string
  const email   = formData.get('email')   as string
  const message = formData.get('message') as string
  if (!name?.trim() || !email?.trim() || !message?.trim()) return { error: 'Por favor completa todos los campos.' }
  console.warn('[Contact]', { name, email, subject: formData.get('subject'), message: message.slice(0, 200) })
  return { success: true }
}
