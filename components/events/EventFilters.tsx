'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { DATE_FILTERS, EVENT_TYPES, REGIONS, SORT_OPTIONS, PRICE_FILTERS, AGE_FILTERS } from '@/lib/constants'

export function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const current = {
    date: searchParams.get('date') ?? '',
    date_custom: searchParams.get('date_custom') ?? '',
    region: searchParams.get('region') ?? '',
    type: searchParams.get('type') ?? '',
    sort: searchParams.get('sort') ?? 'date_asc',
    search: searchParams.get('search') ?? '',
    price: searchParams.get('price') ?? '',
    age: searchParams.get('age') ?? '',
  }

  // 검색창 debounce
  const [searchInput, setSearchInput] = useState(current.search)
  const isMounted = useRef(false)

  // URL의 search 파라미터가 외부에서 바뀌면 input 동기화
  useEffect(() => {
    setSearchInput(current.search)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.search])

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    const timer = setTimeout(() => {
      set('search', searchInput)
    }, 400)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

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

  // 날짜 프리셋 토글 (date_custom 초기화)
  const toggleDate = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('date_custom')
      if (current.date === value) params.delete('date')
      else params.set('date', value)
      router.push(`/events?${params.toString()}`)
    },
    [router, searchParams, current.date]
  )

  // 날짜 직접 선택 (date 프리셋 초기화)
  const setCustomDate = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('date')
      if (value) params.set('date_custom', value)
      else params.delete('date_custom')
      router.push(`/events?${params.toString()}`)
    },
    [router, searchParams]
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

      {/* 검색창 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">검색</p>
        <input
          type="text"
          placeholder="행사명 또는 업체명으로 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400"
        />
      </div>

      {/* 날짜 필터 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">날짜</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
          {DATE_FILTERS.map((f) => (
            <button key={f.value} className={chip(current.date === f.value && !current.date_custom)} onClick={() => toggleDate(f.value)}>
              {f.label}
            </button>
          ))}
          <input
            type="date"
            value={current.date_custom}
            onChange={(e) => setCustomDate(e.target.value)}
            className={cn(
              'text-xs border rounded-full px-3 py-1.5 bg-white focus:outline-none transition-colors cursor-pointer',
              current.date_custom
                ? 'border-rose-500 text-rose-600 font-medium'
                : 'border-gray-200 text-gray-500 hover:border-rose-300'
            )}
          />
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

      {/* 가격 필터 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">가격</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PRICE_FILTERS.map((f) => (
            <button key={f.value} className={chip(current.price === f.value)} onClick={() => toggle('price', f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 연령대 필터 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">연령대</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {AGE_FILTERS.map((f) => (
            <button key={f.value} className={chip(current.age === f.value)} onClick={() => toggle('age', f.value)}>
              {f.label}
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
