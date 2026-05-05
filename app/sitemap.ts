import type { MetadataRoute } from 'next'
import { mockEvents } from '@/data/mock-events'
import { mockOrganizers } from '@/data/mock-organizers'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://solomap.kr'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/legal/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/legal/posting-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  const eventRoutes: MetadataRoute.Sitemap = mockEvents
    .filter((e) => e.status === 'published')
    .map((e) => ({
      url: `${BASE_URL}/events/${e.id}`,
      lastModified: new Date(e.updated_at),
      changeFrequency: 'daily',
      priority: 0.8,
    }))

  const organizerRoutes: MetadataRoute.Sitemap = mockOrganizers.map((o) => ({
    url: `${BASE_URL}/organizers/${o.id}`,
    lastModified: new Date(o.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...eventRoutes, ...organizerRoutes]
}
