'use client'

import { useState, useRef } from 'react'

type UploadType = 'organizers' | 'events'

type ResultRow = {
  row: number
  status: 'success' | 'error'
  name?: string
  title?: string
  message?: string
}

type UploadResult = {
  successCount: number
  errorCount: number
  results: ResultRow[]
}

export function CsvUploader() {
  const [tab, setTab] = useState<UploadType>('organizers')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setResult(null)
    setError('')
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`/api/admin/upload/${tab}`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) setError(data.error ?? '업로드 실패')
    else setResult(data)
    setLoading(false)
  }

  const handleTabChange = (t: UploadType) => {
    setTab(t)
    setFile(null)
    setResult(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleTemplateDownload = async () => {
    const res = await fetch(`/api/admin/templates/${tab}`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tab}_template.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* 탭 */}
      <div className="flex gap-2">
        {(['organizers', 'events'] as UploadType[]).map(t => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-rose-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-300'
            }`}
          >
            {t === 'organizers' ? '업체 (organizers)' : '행사 (events)'}
          </button>
        ))}
      </div>

      {/* 템플릿 다운로드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-900">
            {tab === 'organizers' ? '업체 Excel 템플릿' : '행사 Excel 템플릿'}
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            드롭다운이 포함된 템플릿을 다운로드해서 데이터를 채운 뒤 업로드하세요.
          </p>
        </div>
        <button
          onClick={handleTemplateDownload}
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          템플릿 다운로드 (.xlsx)
        </button>
      </div>

      {/* 필드 안내 */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 space-y-1">
        <div className="flex gap-3 mb-2">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-300 inline-block"></span>
            <span>필수 항목</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-100 inline-block"></span>
            <span>선택 항목</span>
          </span>
        </div>
        {tab === 'organizers' ? (
          <>
            <p><span className="font-semibold text-gray-800">slug:</span> 영문 소문자·숫자·하이픈만 (예: my-organizer)</p>
            <p><span className="font-semibold text-gray-800">official_status:</span> 드롭다운에서 선택 — unclaimed(기본값) / hidden</p>
          </>
        ) : (
          <>
            <p><span className="font-semibold text-gray-800">organizer_slug:</span> 업체를 먼저 업로드한 뒤 해당 slug 입력</p>
            <p><span className="font-semibold text-gray-800">event_date:</span> YYYY-MM-DD 형식 (예: 2024-06-01)</p>
            <p><span className="font-semibold text-gray-800">event_type / status / venue_visibility / source_type:</span> 드롭다운에서 선택</p>
          </>
        )}
      </div>

      {/* 파일 업로드 */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-rose-400 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-500">Excel 파일을 클릭해서 선택하세요</p>
            <p className="text-xs text-gray-400 mt-1">.xlsx 파일만 가능</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-rose-500 text-white rounded-lg py-2.5 font-medium hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '업로드 중...' : `${tab === 'organizers' ? '업체' : '행사'} 업로드`}
      </button>

      {/* 결과 */}
      {result && (
        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
              <span className="font-bold text-green-700">{result.successCount}</span>
              <span className="text-green-600"> 성공</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
              <span className="font-bold text-red-700">{result.errorCount}</span>
              <span className="text-red-600"> 실패</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">행</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">이름</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">결과</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">메시지</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.results.map((r) => (
                  <tr key={r.row} className={r.status === 'error' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 text-gray-500">{r.row}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{r.name ?? r.title}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium ${r.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {r.status === 'success' ? '✓ 성공' : '✗ 실패'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{r.message ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
