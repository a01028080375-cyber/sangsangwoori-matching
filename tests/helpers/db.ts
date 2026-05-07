import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * seniors / jobs 전체 삭제 (matches는 ON DELETE CASCADE로 자동 삭제됨)
 * 테스트 간 데이터 간섭을 막기 위해 beforeEach 마다 호출
 */
export async function resetDb() {
  const neverMatchingId = '00000000-0000-0000-0000-000000000000'
  const { error: m } = await supabase.from('matches').delete().neq('id', neverMatchingId)
  if (m) throw new Error(`resetDb matches 실패: ${m.message}`)
  const { error: s } = await supabase.from('seniors').delete().neq('id', neverMatchingId)
  if (s) throw new Error(`resetDb seniors 실패: ${s.message}`)
  const { error: j } = await supabase.from('jobs').delete().neq('id', neverMatchingId)
  if (j) throw new Error(`resetDb jobs 실패: ${j.message}`)
}

export async function insertJob(data: {
  title: string
  region: string
  job_type: string
  required_career: number
}) {
  const { data: job, error } = await supabase
    .from('jobs')
    .insert(data)
    .select('id')
    .single()
  if (error) throw new Error(`insertJob 실패: ${error.message}`)
  return job as { id: string }
}

export { supabase }
