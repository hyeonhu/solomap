export const EVENT_TYPES = {
  rotation_dating: '로테이션 소개팅',
  solo_party: '솔로파티',
  wine_party: '와인파티',
  coffee_meeting: '커피미팅',
  office_worker_dating: '직장인 소개팅',
  age_limited_party: '연령대 제한 행사',
} as const

export const EVENT_STATUS = {
  draft: '임시저장',
  published: '모집 중',
  closed: '마감',
  cancelled: '취소',
  hidden: '숨김',
  needs_check: '확인 필요',
} as const

export const EVENT_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  published: { label: '모집 중', color: 'green' },
  closed: { label: '마감', color: 'gray' },
  cancelled: { label: '취소', color: 'red' },
  needs_check: { label: '원문 확인 필요', color: 'yellow' },
  draft: { label: '임시저장', color: 'gray' },
  hidden: { label: '숨김', color: 'gray' },
}

export const REGIONS = [
  { value: 'seoul', label: '서울 전체' },
  { value: 'gangnam', label: '강남/서초' },
  { value: 'hongdae', label: '홍대/합정' },
  { value: 'seongsu', label: '성수/건대' },
  { value: 'sinchon', label: '신촌/이대' },
  { value: 'jongno', label: '종로/을지로' },
  { value: 'jamsil', label: '잠실/송파' },
  { value: 'yeouido', label: '여의도/영등포' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'incheon', label: '인천' },
  { value: 'busan', label: '부산' },
  { value: 'daegu', label: '대구' },
  { value: 'daejeon', label: '대전' },
  { value: 'gwangju', label: '광주' },
  { value: 'other', label: '기타' },
] as const

// 1차 출시 데이터 준비 지역 (나머지는 '준비 중')
export const ACTIVE_REGIONS = ['seoul', 'gangnam', 'hongdae', 'seongsu', 'sinchon', 'jongno', 'jamsil', 'yeouido', 'gyeonggi', 'busan', 'daegu', 'daejeon', 'gwangju']

export const DATE_FILTERS = [
  { value: 'today', label: '오늘' },
  { value: 'tomorrow', label: '내일' },
  { value: 'this_weekend', label: '이번 주말' },
  { value: 'this_week', label: '이번 주' },
  { value: 'next_week', label: '다음 주' },
  { value: 'this_month', label: '이번 달' },
] as const

export const SORT_OPTIONS = [
  { value: 'date_asc', label: '날짜 빠른 순' },
  { value: 'created_desc', label: '최근 등록 순' },
  { value: 'price_asc', label: '가격 낮은 순' },
  { value: 'updated_desc', label: '업데이트 최신 순' },
] as const

export const SOURCE_TYPES = {
  public_page: '공개 페이지',
  user_submission: '사용자 제보',
  organizer_submission: '업체 제보',
  partner_feed: '제휴사 제공',
  manual: '운영자 직접 입력',
} as const
