-- ============================================================
-- 지역·직종 정규화 헬퍼 함수 + rematch RPC 재작성
-- 원본 데이터는 변경하지 않고 비교 시에만 정규화 적용
-- ============================================================

-- ── 1) 지역 정규화 함수 ──────────────────────────────────────
CREATE OR REPLACE FUNCTION normalize_region(r text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE r
    WHEN '서울특별시' THEN '서울'
    WHEN '경기도'     THEN '경기'
    WHEN '인천광역시' THEN '인천'
    ELSE r
  END;
$$;

-- ── 2) 직종 정규화 함수 ──────────────────────────────────────
CREATE OR REPLACE FUNCTION normalize_job_type(j text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE j
    WHEN '경비직' THEN '경비'
    WHEN '청소직' THEN '청소'
    WHEN '조리직' THEN '조리'
    WHEN '돌봄직' THEN '돌봄'
    ELSE j
  END;
$$;

-- ── 3) rematch_senior — 정규화 적용 버전 ─────────────────────
CREATE OR REPLACE FUNCTION rematch_senior(p_senior_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_senior RECORD;
  v_job    RECORD;
  v_score  numeric;
  v_s_region text;
  v_s_job    text;
BEGIN
  SELECT * INTO v_senior FROM seniors WHERE id = p_senior_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- 비교용 정규화 (원본 행은 수정하지 않음)
  v_s_region := normalize_region(v_senior.region);
  v_s_job    := normalize_job_type(v_senior.desired_job);

  FOR v_job IN SELECT * FROM jobs LOOP
    v_score := 0;
    IF v_s_region = normalize_region(v_job.region)       THEN v_score := v_score + 3; END IF;
    IF v_s_job    = normalize_job_type(v_job.job_type)   THEN v_score := v_score + 2; END IF;
    IF v_senior.career_years >= v_job.required_career    THEN v_score := v_score + 1; END IF;

    INSERT INTO matches (senior_id, job_id, score, status)
    VALUES (p_senior_id, v_job.id, v_score, 'pending')
    ON CONFLICT (senior_id, job_id)
    DO UPDATE SET score = EXCLUDED.score;
  END LOOP;
END;
$$;

-- ── 4) rematch_job — 정규화 적용 버전 ────────────────────────
CREATE OR REPLACE FUNCTION rematch_job(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_job    RECORD;
  v_senior RECORD;
  v_score  numeric;
  v_j_region text;
  v_j_job    text;
BEGIN
  SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_j_region := normalize_region(v_job.region);
  v_j_job    := normalize_job_type(v_job.job_type);

  FOR v_senior IN SELECT * FROM seniors LOOP
    v_score := 0;
    IF normalize_region(v_senior.region)        = v_j_region THEN v_score := v_score + 3; END IF;
    IF normalize_job_type(v_senior.desired_job) = v_j_job    THEN v_score := v_score + 2; END IF;
    IF v_senior.career_years >= v_job.required_career        THEN v_score := v_score + 1; END IF;

    INSERT INTO matches (senior_id, job_id, score, status)
    VALUES (v_senior.id, p_job_id, v_score, 'pending')
    ON CONFLICT (senior_id, job_id)
    DO UPDATE SET score = EXCLUDED.score;
  END LOOP;
END;
$$;
