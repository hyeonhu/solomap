export type OfficialStatus = 'unclaimed' | 'hidden'

export interface Organizer {
  id: string
  name: string
  slug: string
  description: string | null
  website_url: string | null
  instagram_url: string | null
  kakao_url: string | null
  main_region: string | null
  official_status: OfficialStatus
  created_at: string
  updated_at: string
}
