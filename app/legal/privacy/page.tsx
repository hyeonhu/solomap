export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>
      <div className="prose prose-sm text-gray-700 space-y-4">
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">수집하는 개인정보</h2>
          <p>솔로맵은 다음 정보만 수집·저장합니다.</p>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>관리자 계정 이메일 (내부 운영용)</li>
            <li>어뷰징 방어용 IP 해시, User-Agent, 제출 시각 로그 (스팸 방지 목적, 최대 90일 보관)</li>
          </ul>
          <p className="mt-2">이름, 전화번호, 카카오톡 ID 등 직접 식별 가능한 정보는 수집하지 않습니다.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">분석 도구</h2>
          <p>솔로맵은 방문자 통계 확인을 위해 Plausible Analytics를 사용합니다. Plausible은 쿠키를 사용하지 않으며, 개인 식별 정보를 수집하지 않습니다.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">행사 클릭 로그</h2>
          <p>원문 신청 링크 클릭 시 행사 ID, 익명 세션 ID, 클릭 시각이 내부 DB에 저장됩니다. 이 데이터는 서비스 개선 목적으로만 사용됩니다.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">정보 삭제 요청</h2>
          <p>개인정보 관련 문의 및 삭제 요청은 아래 이메일로 연락해 주세요.</p>
          <p className="font-medium">contact@solomap.kr</p>
        </section>
        <p className="text-xs text-gray-400 mt-8">최종 수정일: 2026년 5월</p>
      </div>
    </div>
  )
}
