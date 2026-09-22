import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Aviso de Privacidad — ConectandoEnsenada.org' }
function S({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '2rem' }}><h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-600)', marginBottom: '0.875rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>{title}</h2>{children}</div>
}
export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-raised)', paddingBlock: '3rem' }}>
      <div className="container-app" style={{ maxWidth: '740px' }}>
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.5rem' }}>Última actualización: 1 de agosto de 2026</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-600)', marginBottom: '2rem' }}>Aviso de Privacidad</h1>
          <div style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--color-text-secondary)' }}>
            <S title="1. Responsable del tratamiento">
              <p>ConectandoEnsenada.org trata sus datos conforme a la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>. Contacto: <a href="mailto:privacidad@conectandoensenada.org" style={{ color: 'var(--color-accent)' }}>privacidad@conectandoensenada.org</a></p>
            </S>
            <S title="2. Datos que recopilamos">
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Identificación: nombre, correo electrónico</li>
                <li>Contacto: teléfono, WhatsApp (opcionales)</li>
                <li>Uso: páginas visitadas, búsquedas (sin PII)</li>
                <li>Contenido: negocios, reseñas y publicaciones enviadas</li>
              </ul>
              <p><strong>No recopilamos</strong> datos de tarjetas ni currículos.</p>
            </S>
            <S title="3. Finalidades">
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Crear y administrar su cuenta</li>
                <li>Mostrar contenido en la plataforma</li>
                <li>Mejorar el servicio mediante análisis anonimizados</li>
                <li>Cumplir obligaciones legales</li>
              </ul>
            </S>
            <S title="4. Transferencias">
              <p>No vendemos sus datos. Los compartimos únicamente con: Supabase Inc. (base de datos), Vercel Inc. (hosting), Google LLC (OAuth), y autoridades cuando haya obligación legal.</p>
            </S>
            <S title="5. Derechos ARCO">
              <p>Puede Acceder, Rectificar, Cancelar y Oponerse al tratamiento. Solicite a <a href="mailto:privacidad@conectandoensenada.org" style={{ color: 'var(--color-accent)' }}>privacidad@conectandoensenada.org</a>. Respondemos en 20 días hábiles.</p>
            </S>
            <S title="6. Cookies">
              <p>Usamos cookies técnicas de sesión y Plausible Analytics (sin cookies de rastreo, sin PII).</p>
            </S>
            <S title="7. Retención">
              <p>Conservamos sus datos mientras su cuenta esté activa. Al eliminarla, sus datos se borran en 30 días.</p>
            </S>
          </div>
        </div>
      </div>
    </div>
  )
}
