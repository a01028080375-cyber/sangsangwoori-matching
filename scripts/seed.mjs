import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ── 1) seniors INSERT (10건) ──────────────────────────────────────────────
const seniors = [
  { name: '김영수', region: '서울',      desired_job: '경비', career_years: 10 },
  { name: '박미경', region: '경기',      desired_job: '청소', career_years:  5 },
  { name: '이정호', region: '서울',      desired_job: '조리', career_years: 15 },
  { name: '최순자', region: '인천',      desired_job: '돌봄', career_years:  8 },
  { name: '정대현', region: '서울',      desired_job: '경비', career_years:  3 },
  { name: '강옥분', region: '경기',      desired_job: '돌봄', career_years: 12 },
  { name: '윤기석', region: '서울',      desired_job: '조리', career_years:  7 },
  { name: '장미자', region: '인천',      desired_job: '청소', career_years:  4 },
  { name: '오상훈', region: '기타',      desired_job: '기타', career_years: 20 },
  { name: '임복순', region: '서울특별시', desired_job: '경비직', career_years: 6 },
]

console.log('▶ seniors INSERT 중...')
const { data: insertedSeniors, error: sErr } = await supabase
  .from('seniors')
  .insert(seniors)
  .select('id, name')

if (sErr) { console.error('seniors INSERT 실패:', sErr.message); process.exit(1) }
console.log(`  → ${insertedSeniors.length}건 삽입 완료`)

// ── 2) jobs INSERT (15건) ─────────────────────────────────────────────────
const jobs = [
  { title: '아파트 경비원 A동',       region: '서울',       job_type: '경비', required_career:  5 },
  { title: '오피스 미화 주간반',       region: '경기',       job_type: '청소', required_career:  2 },
  { title: '어린이집 조리사',         region: '서울',       job_type: '조리', required_career: 10 },
  { title: '방문 요양보호사 서구',     region: '인천',       job_type: '돌봄', required_career:  5 },
  { title: '상가 야간 경비원',        region: '서울',       job_type: '경비', required_career:  3 },
  { title: '주간 돌봄 보조',          region: '경기',       job_type: '돌봄', required_career:  4 },
  { title: '단체급식 보조 조리',       region: '서울',       job_type: '조리', required_career:  3 },
  { title: '호텔 객실 미화',          region: '인천',       job_type: '청소', required_career:  2 },
  { title: '공원 환경 관리',          region: '서울',       job_type: '기타', required_career:  1 },
  { title: '동주민센터 안내 도우미',   region: '경기',       job_type: '기타', required_career:  0 },
  { title: '학교 경비원',            region: '서울특별시', job_type: '경비', required_career:  2 },
  { title: '병원 청소',              region: '인천',       job_type: '청소', required_career:  3 },
  { title: '주간 조리 보조',          region: '서울',       job_type: '조리', required_career:  5 },
  { title: '방문 돌봄 도우미',        region: '경기',       job_type: '돌봄', required_career:  6 },
  { title: '주차 관리원',            region: '서울',       job_type: '경비', required_career:  1 },
]

console.log('▶ jobs INSERT 중...')
const { data: insertedJobs, error: jErr } = await supabase
  .from('jobs')
  .insert(jobs)
  .select('id, title')

if (jErr) { console.error('jobs INSERT 실패:', jErr.message); process.exit(1) }
console.log(`  → ${insertedJobs.length}건 삽입 완료`)

// ── 3) rematch RPC — 새로 삽입된 시니어 × 전체 일자리 점수 계산 ─────────────
console.log('▶ matches 재계산 중 (rematch_senior × 10건)...')
for (const s of insertedSeniors) {
  const { error } = await supabase.rpc('rematch_senior', { p_senior_id: s.id })
  if (error) { console.error(`  rematch_senior(${s.name}) 실패:`, error.message); process.exit(1) }
  process.stdout.write(`  ✓ ${s.name}\n`)
}

// ── 4) 레코드 수 집계 ─────────────────────────────────────────────────────
console.log('\n▶ 최종 레코드 수 집계')
const counts = await Promise.all([
  supabase.from('seniors').select('*', { count: 'exact', head: true }),
  supabase.from('jobs').select('*', { count: 'exact', head: true }),
  supabase.from('matches').select('*', { count: 'exact', head: true }),
])

const [sCount, jCount, mCount] = counts.map(r => r.count ?? 0)
console.log(`  seniors : ${sCount}건`)
console.log(`  jobs    : ${jCount}건`)
console.log(`  matches : ${mCount}건`)
