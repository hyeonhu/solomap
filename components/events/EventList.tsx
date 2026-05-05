import { EventCard } from './EventCard'
import { EmptyState } from '@/components/common/EmptyState'
import type { Event } from '@/types/event'

interface EventListProps {
  events: Event[]
  emptyTitle?: string
  emptyDescription?: string
}

export function EventList({
  events,
  emptyTitle = '행사가 없습니다',
  emptyDescription = '다른 필터를 선택하거나 날짜를 바꿔보세요.',
}: EventListProps) {
  if (events.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
