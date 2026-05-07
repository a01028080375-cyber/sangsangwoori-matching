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

// ── 1) 전체 시니어 rematch ────────────────────────────────────
const { data: allSeniors, error: sErr } = await supabase
  .from('seniors')
  .select('id, name')
  .order('created_at')

if (sErr) { console.error('seniors 조회 실패:', sErr.message); process.exit(1) }

console.log(`▶ 전체 시니어 ${allSeniors.length}명 rematch 시작...`)
for (const s of allSeniors) {
  const { error } = await supabase.rpc('rematch_senior', { p_senior_id: s.id })
  if (error) { console.error(`  rematch_senior(${s.name}) 실패:`, error.message); process.exit(1) }
  process.stdout.write(`  ✓ ${s.name}\n`)
}

// ── 2) 임복순 매칭 점수 확인 ─────────────────────────────────
console.log('\n▶ 임복순 매칭 결과 확인')
const { data: imssi } = await supabase
  .from('seniors')
  .select('id, name, region, desired_job')
  .eq('name', '임복순')
  .single()

const { data: matches } = await supabase
  .from('matches')
  .select('score, jobs(title, region, job_type, required_career)')
  .eq('senior_id', imssi.id)
  .gt('score', 0)
  .order('score', { ascending: false })

console.log(`\n  시니어: ${imssi.name} (원본: 지역="${imssi.region}", 희망직종="${imssi.desired_job}")`)
console.log(`  → 정규화 후: 지역="서울", 희망직종="경비"`)
console.log(`\n  점수 > 0 인 공고 (${matches.length}건):`)
for (const m of matches) {
  const j = m.jobs
  console.log(`    [${m.score}점] ${j.title} | ${j.region} / ${j.job_type} / 요구경력 ${j.required_career}년`)
}
