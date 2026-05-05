-- ============================================================
-- 솔로맵 1차 MVP DB 스키마
-- PostgreSQL / Supabase SQL
-- ============================================================

-- [1] organizers
CREATE TABLE organizers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  website_url     TEXT,
  instagram_url   TEXT,
  kakao_url       TEXT,
  main_region     TEXT,
  official_status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (official_status IN ('unclaimed', 'hidden')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [2] events
CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  event_type       TEXT NOT NULL CHECK (event_type IN (
                     'rotation_dating', 'solo_party', 'wine_party',
                     'coffee_meeting', 'office_worker_dating', 'age_limited_party'
                   )),
  organizer_id     UUID NOT NULL REFERENCES organizers(id) ON DELETE RESTRICT,
  source_url       TEXT NOT NULL,
  source_type      TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN (
                     'public_page', 'user_submission', 'organizer_submission', 'partner_feed', 'manual'
                   )),
  event_date       DATE NOT NULL,
  start_time       TIME,
  end_time         TIME,
  city             TEXT NOT NULL,
  district         TEXT,
  venue_name       TEXT,
  venue_visibility TEXT NOT NULL DEFAULT 'after_signup' CHECK (venue_visibility IN ('public', 'after_signup')),
  price_male       INTEGER,
  price_female     INTEGER,
  price_common     INTEGER,
  age_min_male     SMALLINT,
  age_max_male     SMALLINT,
  age_min_female   SMALLINT,
  age_max_female   SMALLINT,
  capacity_male    SMALLINT,
  capacity_female  SMALLINT,
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                     'draft', 'published', 'closed', 'cancelled', 'hidden', 'needs_check'
                   )),
  summary          TEXT,
  admin_note       TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_date        ON events(event_date);
CREATE INDEX idx_events_status      ON events(status);
CREATE INDEX idx_events_organizer   ON events(organizer_id);
CREATE INDEX idx_events_city        ON events(city);
CREATE INDEX idx_events_event_type  ON events(event_type);

-- [3] event_submissions
CREATE TABLE event_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url     TEXT NOT NULL,
  title          TEXT,
  organizer_name TEXT,
  event_date     DATE,
  city           TEXT,
  district       TEXT,
  memo           TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                   'pending', 'reviewing', 'approved', 'rejected', 'duplicate'
                 )),
  admin_note     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_status ON event_submissions(status);

-- [4] submission_abuse_logs
-- IP는 해시로만 저장, 최대 90일 보관 후 삭제
CREATE TABLE submission_abuse_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash      TEXT NOT NULL,
  user_agent   TEXT,
  source_url   TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action       TEXT NOT NULL CHECK (action IN (
                 'allowed', 'rate_limited', 'duplicate_candidate', 'auto_hold'
               )),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_abuse_logs_ip_hash     ON submission_abuse_logs(ip_hash);
CREATE INDEX idx_abuse_logs_submitted   ON submission_abuse_logs(submitted_at);

-- [5] admin_users (Supabase Auth와 별개로 역할 관리)
CREATE TABLE admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [6] outbound_clicks (원문 링크 클릭 로그)
CREATE TABLE outbound_clicks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_id  UUID REFERENCES organizers(id) ON DELETE SET NULL,
  source_url    TEXT NOT NULL,
  clicked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id    TEXT,
  referrer      TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT
);

CREATE INDEX idx_clicks_event_id   ON outbound_clicks(event_id);
CREATE INDEX idx_clicks_clicked_at ON outbound_clicks(clicked_at);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE organizers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_abuse_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_clicks    ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: published/needs_check 행사만
CREATE POLICY "public_read_events" ON events
  FOR SELECT USING (status IN ('published', 'needs_check'));

-- 공개 읽기: unclaimed 업체
CREATE POLICY "public_read_organizers" ON organizers
  FOR SELECT USING (official_status != 'hidden');

-- 클릭 로그: 익명도 INSERT 가능 (API Route에서 anon key로 호출)
CREATE POLICY "insert_outbound_clicks" ON outbound_clicks
  FOR INSERT WITH CHECK (true);

-- 제보 INSERT: 익명 가능
CREATE POLICY "insert_event_submissions" ON event_submissions
  FOR INSERT WITH CHECK (true);

-- 어뷰징 로그 INSERT: 익명 가능
CREATE POLICY "insert_abuse_logs" ON submission_abuse_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizers_updated_at
  BEFORE UPDATE ON organizers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_submissions_updated_at
  BEFORE UPDATE ON event_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 어뷰징 로그 90일 자동 삭제 (pg_cron 또는 Supabase Edge Function으로 실행)
-- ============================================================
-- DELETE FROM submission_abuse_logs WHERE created_at < now() - INTERVAL '90 days';
