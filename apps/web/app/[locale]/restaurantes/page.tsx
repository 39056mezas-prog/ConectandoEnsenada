import type { Metadata } from 'next'
import { DirectoryListing } from '@/components/directory/DirectoryListing'
export const metadata: Metadata = { title: 'Restaurantes en Ensenada', description: 'Directorio de restaurantes en Ensenada: mariscos, tacos, cocina de autor y más.' }
export default function RestaurantesPage() {
  return <DirectoryListing config={{ placeType: 'restaurant', categoryModule: 'businesses', emoji: '🍽️', titleEs: 'Restaurantes en Ensenada', subtitleEs: 'Mariscos, tacos, cocina de autor y más', emptyTitle: 'Sé el primero en agregar un restaurante', emptySubtitle: '¿Conoces un buen restaurante en Ensenada?', contributeHref: '/negocios/nuevo', contributeLabel: 'Agregar restaurante' }} />
}
