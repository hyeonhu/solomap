'use client'

import { useState, useRef } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { Button } from '@/components/common/Button'
import { REGIONS } from '@/lib/constants'

export function SubmitForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const turnstileTokenRef = useRef<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!turnstileTokenRef.current) {
      setError('CAPTCHA를 완료해 주세요.')
      return
    }

    setLoading(true)
    const form = e.currentTarget
    const data = {
      ...Object.fromEntries(new FormData(form)),
      cf_turnstile_response: turnstileTokenRef.current,
    }

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const d = await res.json()
        setError(d.error ?? '제출에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-bold text-gray-900 mb-2">제보해 주셔서 감사합니다!</h2>
        <p className="text-sm text-gray-500">운영자 검수 후 솔로맵에 등록됩니다.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          행사 링크 <span className="text-rose-500">*</span>
        </label>
        <input
          type="url"
          name="source_url"
          required
          placeholder="https://..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          행사명 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="행사명을 입력해 주세요"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">업체명</label>
        <input
          type="text"
          name="organizer_name"
          placeholder="업체명을 입력해 주세요"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">행사 날짜</label>
          <input
            type="date"
            name="event_date"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
          <select
            name="city"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white"
          >
            <option value="">선택</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.label}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
        <textarea
          name="memo"
          rows={3}
          placeholder="추가로 전달할 내용이 있으면 입력해 주세요 (선택)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 resize-none"
        />
      </div>

      {/* Cloudflare Turnstile CAPTCHA */}
      <div>
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => { turnstileTokenRef.current = token }}
            onExpire={() => { turnstileTokenRef.current = '' }}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-400 text-center">
            CAPTCHA (개발 환경 — NEXT_PUBLIC_TURNSTILE_SITE_KEY 설정 시 활성화)
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? '제출 중...' : '제보 제출'}
      </Button>
    </form>
  )
}
