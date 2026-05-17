'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  eventId: string
  currentStatus: string
}

export function EventStatusToggle({ eventId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isOpen = status === 'published' || status === 'needs_check'

  const handleToggle = async () => {
    const nextStatus = isOpen ? 'closed' : 'published'
    setLoading(true)
    const res = await fetch(`/api/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (res.ok) {
      setStatus(nextStatus)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isOpen ? '마감 처리' : '게시 재개'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        isOpen ? 'bg-green-400' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          isOpen ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
