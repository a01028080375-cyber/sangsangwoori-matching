import { createClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// 1) 시연용 시니어 등록
console.log('▶ 시연용 시니어 등록 중...')
const { data, error } = await supabase
  .from('seniors')
  .insert({ name: '시연참가자', region: '서울', desired_job: '경비', career_years: 8 })
  .select('id')
  .single()

if (error) { console.error('등록 실패:', error.message); process.exit(1) }
console.log(`  → 등록 완료 (id: ${data.id})`)

// 2) 자동 매칭 점수 계산
console.log('▶ 매칭 점수 계산 중...')
await supabase.rpc('rematch_senior', { p_senior_id: data.id })
console.log('  → 완료')

// 3) 추천 페이지를 브라우저로 오픈
const url = `https://sangsangwoori.vercel.app/recommendations?senior_id=${data.id}`
console.log(`\n✅ 등록 완료! 추천 결과 페이지를 엽니다:`)
console.log(`   ${url}`)
exec(`start msedge "${url}"`)
