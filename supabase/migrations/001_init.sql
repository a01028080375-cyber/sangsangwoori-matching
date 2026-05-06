-- ============================================================
-- 상상우리 시니어 매칭 시스템 초기 스키마
-- 학습 환경 전용 — 실서비스 전 RLS 정책 재설계 필수
-- ============================================================

CREATE TABLE IF NOT EXISTS seniors (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text NOT NULL,
  region       text NOT NULL,
  desired_job  text NOT NULL,
  career_years integer NOT NULL CHECK (career_years >= 0),
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title            text NOT NULL,
  region           text NOT NULL,
  job_type         text NOT NULL,
  required_career  integer NOT NULL CHECK (required_career >= 0),
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id  uuid NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  job_id     uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  score      numeric NOT NULL CHECK (score >= 0),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS 비활성화 (학습 환경 전용)
-- ============================================================

ALTER TABLE seniors DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs    DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
