export type SubmissionStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'duplicate'

export interface EventSubmission {
  id: string
  source_url: string
  title: string | null
  organizer_name: string | null
  event_date: string | null
  city: string | null
  district: string | null
  memo: string | null
  status: SubmissionStatus
  admin_note: string | null
  created_at: string
  updated_at: string
}
