export default function PostingPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">정보 게시 정책</h1>
      <div className="prose prose-sm text-gray-700 space-y-4">
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">게시 기준</h2>
          <p>솔로맵은 공개적으로 접근 가능한 행사 정보, 업체가 직접 제공한 정보, 사용자 제보 정보, 제휴사 제공 정보를 게시합니다. 비공개 페이지 정보, 로그인 우회로 수집한 정보는 게시하지 않습니다.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">저작권 신고</h2>
          <p>게시된 정보가 귀하의 저작권을 침해한다고 판단되시면 아래 이메일로 신고해 주세요. 확인 후 신속히 처리하겠습니다.</p>
          <p className="font-medium">contact@solomap.kr</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">정보 수정 요청</h2>
          <p>게시된 행사 정보가 부정확하거나 변경된 경우 수정을 요청하실 수 있습니다. 행사 상세 페이지 하단의 "정보 오류 제보" 버튼을 이용하거나 이메일로 연락해 주세요.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">정보 삭제 요청</h2>
          <p>게시 중단 또는 삭제를 원하시면 이메일로 요청해 주세요. 확인 후 처리해 드립니다.</p>
          <p className="font-medium">contact@solomap.kr</p>
        </section>
        <p className="text-xs text-gray-400 mt-8">최종 수정일: 2026년 5월</p>
      </div>
    </div>
  )
}
