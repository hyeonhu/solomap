'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/common/Button'
import { EVENT_TYPES, REGIONS } from '@/lib/constants'
import type { Event } from '@/types/event'

interface EventFormProps {
  initialData?: Partial<Event>
  mode: 'create' | 'edit'
}

export function EventForm({ initialData, mode }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 원문 링크 중복 체크
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url ?? '')
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'ok' | 'duplicate'>('idle')
  const [dupTitle, setDupTitle] = useState('')
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    if (!sourceUrl) { setUrlStatus('idle'); return }

    setUrlStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ check_url: sourceUrl })
        if (mode === 'edit' && initialData?.id) params.set('exclude_id', initialData.id)
        const res = await fetch(`/api/admin/events?${params}`, { credentials: 'include' })
        const d = await res.json()
        if (d.duplicate) {
          setUrlStatus('duplicate')
          setDupTitle(d.event?.title ?? '')
        } else {
          setUrlStatus('ok')
        }
      } catch {
        setUrlStatus('idle')
      }
    }, 500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceUrl])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const url = mode === 'create' ? '/api/admin/events' : `/api/admin/events/${initialData?.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push('/admin/events')
    } else {
      const d = await res.json()
      setError(d.error ?? '저장에 실패했습니다.')
    }
    setLoading(false)
  }

  const field = (name: string, label: string, type = 'text', required = false, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={initialData?.[name as keyof Event] as string ?? ''}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-3">기본 정보</h2>
        <div className="space-y-3">
          {field('title', '행사명', 'text', true)}

          {/* 원문 링크 — 중복 체크 포함 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              원문 링크 <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              name="source_url"
              required
              placeholder="https://"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                urlStatus === 'duplicate'
                  ? 'border-red-400 focus:border-red-400'
                  : urlStatus === 'ok'
                  ? 'border-green-400 focus:border-green-400'
                  : 'border-gray-200 focus:border-rose-400'
              }`}
            />
            {urlStatus === 'checking' && (
              <p className="text-xs text-gray-400 mt-1">확인 중...</p>
            )}
            {urlStatus === 'duplicate' && (
              <p className="text-xs text-red-500 mt-1">
                ⚠ 이미 등록된 링크입니다{dupTitle ? ` — "${dupTitle}"` : ''}.
              </p>
            )}
            {urlStatus === 'ok' && (
              <p className="text-xs text-green-600 mt-1">✓ 사용 가능한 링크입니다.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">행사 유형 <span className="text-rose-500">*</span></label>
              <select name="event_type" required defaultValue={initialData?.event_type ?? ''}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white">
                <option value="">선택</option>
                {Object.entries(EVENT_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select name="status" defaultValue={initialData?.status ?? 'draft'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white">
                {[['draft','임시저장'],['published','게시'],['needs_check','확인 필요'],['closed','마감'],['cancelled','취소'],['hidden','숨김']].map(([v,l]) =>
                  <option key={v} value={v}>{l}</option>
                )}
              </select>
            </div>
          </div>

          {field('organizer_id', '업체 ID (organizers.id)', 'text', true)}
        </div>
      </section>

      {/* 일정/장소 */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-3">일정 및 장소</h2>
        <div className="grid grid-cols-2 gap-3">
          {field('event_date', '행사 날짜', 'date', true)}
          {field('start_time', '시작 시간', 'time')}
          {field('end_time', '종료 시간', 'time')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">지역 <span className="text-rose-500">*</span></label>
            <select name="district" required defaultValue={initialData?.district ?? ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white">
              <option value="">선택</option>
              {REGIONS.map((r) => <option key={r.value} value={r.label}>{r.label}</option>)}
            </select>
          </div>
          {field('city', '시/도', 'text', true, '서울')}
          {field('venue_name', '장소명')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">장소 공개</label>
            <select name="venue_visibility" defaultValue={initialData?.venue_visibility ?? 'after_signup'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white">
              <option value="after_signup">신청 후 공개</option>
              <option value="public">공개</option>
            </select>
          </div>
        </div>
      </section>

      {/* 가격/연령 */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-3">가격 및 연령</h2>
        <div className="grid grid-cols-2 gap-3">
          {field('price_male', '남성 가격 (원)', 'number')}
          {field('price_female', '여성 가격 (원)', 'number')}
          {field('price_common', '공통 가격 (원)', 'number')}
          <div />
          {field('age_min_male', '남성 최소 연령', 'number')}
          {field('age_max_male', '남성 최대 연령', 'number')}
          {field('age_min_female', '여성 최소 연령', 'number')}
          {field('age_max_female', '여성 최대 연령', 'number')}
          {field('capacity_male', '남성 정원', 'number')}
          {field('capacity_female', '여성 정원', 'number')}
        </div>
      </section>

      {/* 요약/메모 */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-3">요약 및 메모</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">행사 요약</label>
            <textarea name="summary" rows={3} defaultValue={initialData?.summary ?? ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">관리자 메모 (비공개)</label>
            <textarea name="admin_note" rows={2} defaultValue={initialData?.admin_note ?? ''}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 resize-none" />
          </div>
          {field('last_verified_at', '마지막 확인일', 'date')}
        </div>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? '저장 중...' : mode === 'create' ? '행사 등록' : '수정 저장'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  )
}
