'use client'

import { useState } from 'react'
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
          {field('source_url', '원문 링크', 'url', true, 'https://')}

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
