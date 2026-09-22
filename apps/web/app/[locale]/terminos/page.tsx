import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Términos de Servicio — ConectandoEnsenada.org' }
function S({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '2rem' }}><h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.875rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>{title}</h2>{children}</div>
}
export default function TerminosPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)', paddingBlock: '3rem' }}>
      <div className="container-app" style={{ maxWidth: '740px' }}>
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.5rem' }}>Última actualización: 1 de agosto de 2026</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '2rem' }}>Términos de Servicio</h1>
          <div style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--color-text-secondary)' }}>
            <S title="1. Aceptación"><p>Al acceder a ConectandoEnsenada.org aceptas estos Términos. Si no estás de acuerdo, no uses la plataforma.</p></S>
            <S title="2. Servicio"><p>Plataforma digital de directorio e información local para Ensenada, Baja California, México.</p></S>
            <S title="3. Cuentas">
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Debes proporcionar información veraz</li>
                <li>Eres responsable de la seguridad de tu cuenta</li>
                <li>Una persona = una cuenta</li>
              </ul>
            </S>
            <S title="4. Conducta prohibida">
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Publicar información falsa o fraudulenta</li>
                <li>Suplantar identidades</li>
                <li>Contenido ilegal, ofensivo o discriminatorio</li>
                <li>Spam o publicaciones duplicadas</li>
                <li>Actividades ilegales bajo la ley mexicana</li>
              </ul>
            </S>
            <S title="5. Ley aplicable"><p>Estos Términos se rigen por las leyes de los <strong>Estados Unidos Mexicanos</strong>. Disputas ante tribunales de <strong>Ensenada, Baja California</strong>.</p></S>
            <S title="6. Contacto"><p><a href="mailto:legal@conectandoensenada.org" style={{ color: 'var(--color-accent)' }}>legal@conectandoensenada.org</a></p></S>
          </div>
        </div>
      </div>
    </div>
  )
}
