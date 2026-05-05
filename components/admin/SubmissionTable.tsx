'use client'

import { useState } from 'react'
import type { EventSubmission, SubmissionStatus } from '@/types/submission'

const STATUS_LABELS: Record<SubmissionStatus, { label: string; color: string }> = {
  pending:   { label: '대기', color: 'bg-gray-100 text-gray-600' },
  reviewing: { label: '검토 중', color: 'bg-blue-100 text-blue-700' },
  approved:  { label: '승인', color: 'bg-green-100 text-green-700' },
  rejected:  { label: '반려', color: 'bg-red-100 text-red-700' },
  duplicate: { label: '중복', color: 'bg-yellow-100 text-yellow-700' },
}

export function SubmissionTable({ submissions: initial }: { submissions: EventSubmission[] }) {
  const [submissions, setSubmissions] = useState(initial)

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    // DB 연결 후 실제 API 호출로 교체
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s))
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {['제목', '업체', '날짜', '지역', '메모', '상태', '제출일', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {submissions.map((sub) => {
            const s = STATUS_LABELS[sub.status]
            return (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 max-w-xs">
                  <a href={sub.source_url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium truncate block">
                    {sub.title ?? '제목 없음'}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-600">{sub.organizer_name ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{sub.event_date ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{sub.district ?? sub.city ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{sub.memo ?? '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                  {new Date(sub.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    <button onClick={() => updateStatus(sub.id, 'approved')}
                      className="text-xs text-green-600 hover:underline">승인</button>
                    <button onClick={() => updateStatus(sub.id, 'rejected')}
                      className="text-xs text-red-500 hover:underline">반려</button>
                    <button onClick={() => updateStatus(sub.id, 'duplicate')}
                      className="text-xs text-gray-400 hover:underline">중복</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {submissions.length === 0 && (
        <div className="py-12 text-center text-gray-400 text-sm">처리할 제보가 없습니다.</div>
      )}
    </div>
  )
}
