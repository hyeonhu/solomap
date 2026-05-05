export type EventType =
  | 'rotation_dating'
  | 'solo_party'
  | 'wine_party'
  | 'coffee_meeting'
  | 'office_worker_dating'
  | 'age_limited_party'

export type EventStatus = 'draft' | 'published' | 'closed' | 'cancelled' | 'hidden' | 'needs_check'

export type SourceType = 'public_page' | 'user_submission' | 'organizer_submission' | 'partner_feed' | 'manual'

export type VenueVisibility = 'public' | 'after_signup'

export interface Event {
  id: string
  title: string
  slug: string
  event_type: EventType
  organizer_id: string
  organizer?: Organizer
  source_url: string
  source_type: SourceType
  event_date: string        // ISO date string
  start_time: string | null // HH:MM
  end_time: string | null   // HH:MM
  city: string
  district: string
  venue_name: string | null
  venue_visibility: VenueVisibility
  price_male: number | null
  price_female: number | null
  price_common: number | null
  age_min_male: number | null
  age_max_male: number | null
  age_min_female: number | null
  age_max_female: number | null
  capacity_male: number | null
  capacity_female: number | null
  status: EventStatus
  summary: string | null
  admin_note: string | null
  last_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface EventFilters {
  region?: string
  dateFilter?: string
  dateFrom?: string
  dateTo?: string
  eventType?: EventType
  priceMax?: number
  ageMin?: number
  ageMax?: number
  status?: EventStatus
  organizerId?: string
  sort?: string
}

import type { Organizer } from './organizer'
