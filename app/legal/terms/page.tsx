export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">이용약관</h1>
      <div className="prose prose-sm text-gray-700 space-y-4">
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">제1조 (목적)</h2>
          <p>본 약관은 솔로맵(이하 "서비스")이 제공하는 로테이션 소개팅·솔로파티 정보 포털 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">제2조 (서비스 성격)</h2>
          <p>솔로맵은 공개된 행사 정보를 수집·정리하여 제공하는 정보 포털 서비스입니다. 자체 결제, 예약, 환불을 수행하지 않으며, 실제 행사 신청은 외부 원문 페이지에서 직접 진행해야 합니다.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">제3조 (정보의 정확성)</h2>
          <p>솔로맵에 게시된 행사 정보(가격, 날짜, 장소, 모집 상태 등)는 원문 페이지 기준으로 작성되었으나, 변경될 수 있습니다. 신청 전 반드시 원문 페이지에서 최신 정보를 확인하시기 바랍니다.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">제4조 (면책)</h2>
          <p>솔로맵은 행사 주최사와 참여자 간 분쟁, 결제, 환불, 개인정보 처리 등에 대한 책임을 지지 않습니다.</p>
        </section>
        <p className="text-xs text-gray-400 mt-8">최종 수정일: 2026년 5월</p>
      </div>
    </div>
  )
}
