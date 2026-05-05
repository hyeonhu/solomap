'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { DATE_FILTERS, EVENT_TYPES, REGIONS, SORT_OPTIONS } from '@/lib/constants'

export function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const current = {
    date: searchParams.get('date') ?? '',
    region: searchParams.get('region') ?? '',
    type: searchParams.get('type') ?? '',
    sort: searchParams.get('sort') ?? 'date_asc',
  }

  const set = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`/events?${params.toString()}`)
    },
    [router, searchParams]
  )

  const toggle = useCallback(
    (key: string, value: string) => {
      set(key, current[key as keyof typeof current] === value ? '' : value)
    },
    [set, current]
  )

  const chip = (active: boolean) =>
    cn(
      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap',
      active
        ? 'bg-rose-500 border-rose-500 text-white'
        : 'bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-600'
    )

  return (
    <div className="space-y-4">
      {/* 날짜 필터 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">날짜</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {DATE_FILTERS.map((f) => (
            <button key={f.value} className={chip(current.date === f.value)} onClick={() => toggle('date', f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 지역 필터 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">지역</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {REGIONS.map((r) => (
            <button key={r.value} className={chip(current.region === r.value)} onClick={() => toggle('region', r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 행사 유형 필터 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">행사 유형</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {Object.entries(EVENT_TYPES).map(([value, label]) => (
            <button key={value} className={chip(current.type === value)} onClick={() => toggle('type', value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 정렬 */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-400 shrink-0">정렬</p>
        <select
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-rose-400"
          value={current.sort}
          onChange={(e) => set('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
