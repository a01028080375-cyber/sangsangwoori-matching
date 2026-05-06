-- matches 테이블 status 컬럼 추가 + 자동 재매칭 RPC

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'assigned', 'done'));

ALTER TABLE matches
  ADD CONSTRAINT matches_senior_job_unique UNIQUE (senior_id, job_id);

-- 특정 시니어 × 모든 일자리 재계산
CREATE OR REPLACE FUNCTION rematch_senior(p_senior_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_senior RECORD;
  v_job    RECORD;
  v_score  numeric;
BEGIN
  SELECT * INTO v_senior FROM seniors WHERE id = p_senior_id;
  IF NOT FOUND THEN RETURN; END IF;

  FOR v_job IN SELECT * FROM jobs LOOP
    v_score := 0;
    IF v_senior.region       = v_job.region           THEN v_score := v_score + 3; END IF;
    IF v_senior.desired_job  = v_job.job_type          THEN v_score := v_score + 2; END IF;
    IF v_senior.career_years >= v_job.required_career  THEN v_score := v_score + 1; END IF;

    INSERT INTO matches (senior_id, job_id, score, status)
    VALUES (p_senior_id, v_job.id, v_score, 'pending')
    ON CONFLICT (senior_id, job_id)
    DO UPDATE SET score = EXCLUDED.score;
  END LOOP;
END;
$$;

-- 특정 일자리 × 모든 시니어 재계산
CREATE OR REPLACE FUNCTION rematch_job(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_job    RECORD;
  v_senior RECORD;
  v_score  numeric;
BEGIN
  SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
  IF NOT FOUND THEN RETURN; END IF;

  FOR v_senior IN SELECT * FROM seniors LOOP
    v_score := 0;
    IF v_senior.region       = v_job.region           THEN v_score := v_score + 3; END IF;
    IF v_senior.desired_job  = v_job.job_type          THEN v_score := v_score + 2; END IF;
    IF v_senior.career_years >= v_job.required_career  THEN v_score := v_score + 1; END IF;

    INSERT INTO matches (senior_id, job_id, score, status)
    VALUES (v_senior.id, p_job_id, v_score, 'pending')
    ON CONFLICT (senior_id, job_id)
    DO UPDATE SET score = EXCLUDED.score;
  END LOOP;
END;
$$;
