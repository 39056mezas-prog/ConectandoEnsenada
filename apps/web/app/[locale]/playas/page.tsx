import type { Metadata } from 'next'
import { DirectoryListing } from '@/components/directory/DirectoryListing'
export const metadata: Metadata = { title: 'Playas de Ensenada', description: 'Descubre las mejores playas de Ensenada, Baja California.' }
export default function PlayasPage() {
  return <DirectoryListing config={{ placeType: 'beach', categoryModule: 'beaches', emoji: '🏖️', titleEs: 'Playas de Ensenada', subtitleEs: 'Guía completa de playas en Baja California', emptyTitle: 'Ayúdanos a mapear las playas', emptySubtitle: '¿Conoces una playa en Ensenada? Agrégala.', contributeHref: '/negocios/nuevo', contributeLabel: 'Agregar una playa' }} />
}
