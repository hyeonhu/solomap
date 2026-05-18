# 솔로맵 (SoloMap)

> 로테이션 소개팅·솔로파티 링크 포털 — 비회원 조회형 1차 MVP

🌐 **[solomap.kr](https://solomap.kr)**

---

## 프로젝트 개요

지역·날짜·가격·연령대별로 로테이션 소개팅과 솔로파티 행사를 한눈에 비교하고, 원문 신청 링크로 바로 이동할 수 있는 포털 서비스입니다.

- 회원가입 없이 누구나 조회 가능
- 관리자가 직접 행사 데이터를 등록·관리
- 사용자 제보를 통한 데이터 확충

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15+ (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 데이터베이스 | Supabase (PostgreSQL + RLS) |
| 인증 | Supabase Auth (관리자 전용) + HttpOnly Cookie |
| CAPTCHA | Cloudflare Turnstile |
| 분석 | Plausible Analytics + 자체 outbound_clicks 테이블 |
| 배포 | Vercel (GitHub 자동 배포) |
| CDN/DNS | Cloudflare |

---

## 주요 기능

### 공개 페이지
- **메인**: 이번 주말 행사 + 최근 등록 행사 + 빠른 필터
- **행사 목록**: 지역·날짜·유형·정렬 필터링
- **행사 상세**: 가격·연령·정원·장소 정보 + 원문 링크 이동
- **업체 상세**: 업체 정보 + 진행 중/지난 행사 목록
- **제보 폼**: Turnstile CAPTCHA + IP 해시 Rate Limit + 중복 방지

### 관리자 패널 (`/admin`)
- 로그인 보호 (미들웨어 + HttpOnly Cookie)
- 대시보드: 전체/게시/확인필요/업체 수 통계
- 행사 관리: 목록·등록·수정·마감 토글
- **Excel 업로드**: 업체·행사 일괄 등록 (드롭다운 유효성 검사 포함)
- 제보 관리: 승인·반려 처리

---

## 개발 히스토리

| Phase | 내용 | 커밋 |
|-------|------|------|
| Phase 0 | Next.js 프로젝트 초기화, 폴더 구조 설계 | [446c66b](https://github.com/hyeonhu/solomap/commit/446c66b) |
| Phase 1 | Mock 데이터 6개 행사/3개 업체, TypeScript 타입, 전체 14개 페이지 UI | [1d618ef](https://github.com/hyeonhu/solomap/commit/1d618ef) |
| Phase 2 | `supabase/schema.sql` — 6개 테이블 + RLS + updated_at 트리거 | [1d618ef](https://github.com/hyeonhu/solomap/commit/1d618ef) |
| Phase 3 | 관리자 로그인, 행사 CRUD 폼, 제보 관리 테이블 | [1d618ef](https://github.com/hyeonhu/solomap/commit/1d618ef) |
| Phase 4 | Cloudflare Turnstile CAPTCHA, IP 해시 Rate Limit, Admin Auth API | [1d618ef](https://github.com/hyeonhu/solomap/commit/1d618ef) |
| Phase 5 | `/api/track/click` outbound_clicks 로그, Plausible Script | [1d618ef](https://github.com/hyeonhu/solomap/commit/1d618ef) |
| Phase 6 | generateMetadata, sitemap.xml, robots.txt | [1d618ef](https://github.com/hyeonhu/solomap/commit/1d618ef) |
| Phase 7 | GitHub 연동, Vercel 배포, Supabase 실연결, 도메인(solomap.kr) 연결 | (인프라) |
| Phase 8 | Mock → Supabase 실데이터 교체 (`lib/queries.ts`) | [fb46ba9](https://github.com/hyeonhu/solomap/commit/fb46ba9) |
| Phase 9 | 관리자 페이지 미들웨어 인증 보호 | [2f8cc56](https://github.com/hyeonhu/solomap/commit/2f8cc56) |
| Phase 10 | Excel(.xlsx) 업로드 기능 — 드롭다운 템플릿 + 일괄 INSERT | [1d46879](https://github.com/hyeonhu/solomap/commit/1d46879) |
| Phase 11 | 행사 목록 마감 토글 버튼 (즉시 published ↔ closed 전환) | [83a8628](https://github.com/hyeonhu/solomap/commit/83a8628) |
| Phase 12 | 행사 필터 확장 (검색·가격·연령대·날짜직접선택·마감임박순), 메인 지역별 섹션 | [751578c](https://github.com/hyeonhu/solomap/commit/751578c) |
| Phase 13 | 라이트모드 강제 고정 (다크모드 비활성화) | [9415d0f](https://github.com/hyeonhu/solomap/commit/9415d0f) |
| Phase 14 | 원문 링크 중복 체크 (폼 실시간 확인 + PUT API) | [b96176b](https://github.com/hyeonhu/solomap/commit/b96176b) |
| Phase 15 | Google Analytics 4 설치 + 이벤트 추적 (원문 클릭, 검색어) | [8a01660](https://github.com/hyeonhu/solomap/commit/8a01660) [1240e19](https://github.com/hyeonhu/solomap/commit/1240e19) |

---

## DB 스키마

```
organizers        — 업체 정보
events            — 행사 정보 (organizer_id FK)
event_submissions — 사용자 제보
submission_abuse_logs — IP 해시 어뷰징 로그 (90일 보관)
admin_users       — 관리자 계정 (Supabase Auth 연동)
outbound_clicks   — 원문 링크 클릭 로그
```

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 Supabase, Turnstile 키 입력

# 개발 서버 실행
npm run dev
```

`.env.local` 필요 항목:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=
IP_HASH_SALT=
```

---

## 라우트 구조

```
/                        메인
/events                  행사 목록
/events/[id]             행사 상세
/organizers/[id]         업체 상세
/submit                  행사 제보
/legal/*                 약관/개인정보처리방침/게시정책

/admin                   대시보드
/admin/events            행사 관리
/admin/events/new        행사 등록
/admin/events/[id]/edit  행사 수정
/admin/upload            Excel 업로드
/admin/submissions       제보 관리

/api/submissions              제보 접수
/api/track/click              클릭 추적
/api/admin/auth/login         관리자 로그인
/api/admin/events             행사 CRUD
/api/admin/events/[id]        행사 수정/삭제/상태변경
/api/admin/upload/organizers  업체 Excel 업로드
/api/admin/upload/events      행사 Excel 업로드
/api/admin/templates/*        Excel 템플릿 다운로드
/api/admin/submissions/[id]   제보 처리
```
