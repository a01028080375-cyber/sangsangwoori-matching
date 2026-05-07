export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Props = {
  searchParams: Promise<{ senior_id?: string }>
}

type MatchRow = {
  id: string
  score: number
  status: string
  jobs: {
    id: string
    title: string
    region: string
    job_type: string
    required_career: number
  }
}

function scoreBadgeClass(score: number): string {
  if (score >= 6) return 'bg-yellow-400 text-yellow-900'
  if (score >= 4) return 'bg-green-500 text-white'
  return 'bg-gray-300 text-gray-700'
}

function scoreBadgeLabel(score: number): string {
  if (score >= 6) return '매우 적합'
  if (score >= 4) return '적합'
  if (score >= 2) return '보통'
  return ''
}

export default async function RecommendationsPage({ searchParams }: Props) {
  const { senior_id } = await searchParams

  if (!senior_id) {
    const { data: allSeniors } = await supabase
      .from('seniors')
      .select('id, name, region, desired_job')
      .order('name')

    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">추천 일자리 목록</h1>
          <p className="mt-2 text-xl text-gray-600">이름을 선택하면 해당 분의 추천 결과를 볼 수 있습니다.</p>
        </div>

        {!allSeniors || allSeniors.length === 0 ? (
          <div className="rounded-lg border border-gray-300 bg-gray-50 px-6 py-6 text-xl text-gray-500">
            아직 등록된 시니어가 없습니다.{' '}
            <Link href="/register" className="font-semibold text-gray-900 underline">
              프로필 등록
            </Link>
            을 먼저 해주세요.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {allSeniors.map(s => (
              <Link
                key={s.id}
                href={`/recommendations?senior_id=${s.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-gray-900">{s.name}</span>
                  <span className="text-lg text-gray-500">{s.region} · {s.desired_job}</span>
                </div>
                <span className="text-xl text-gray-400">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const { data: senior } = await supabase
    .from('seniors')
    .select('name, region, desired_job')
    .eq('id', senior_id)
    .single()

  const { data: matches } = await supabase
    .from('matches')
    .select('id, score, status, jobs(id, title, region, job_type, required_career)')
    .eq('senior_id', senior_id)
    .order('score', { ascending: false })

  const validMatches = (matches as MatchRow[] | null ?? []).filter(m => m.score > 0)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          {senior ? `${senior.name}님께 맞는 일자리` : '추천 일자리 목록'}
        </h1>
        {senior && (
          <p className="mt-2 text-xl text-gray-600">
            {senior.region} · {senior.desired_job} 기준으로 찾은 맞춤 추천입니다.
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-xl border bg-gray-50 p-4">
        <span className="text-lg font-medium text-gray-700">정렬 기준:</span>
        <Badge variant="secondary" className="text-base px-3 py-1">매칭 점수 높은 순</Badge>
        <span className="ml-auto text-lg text-gray-500">총 {validMatches.length}건</span>
      </div>

      {validMatches.length === 0 ? (
        <div className="rounded-lg border border-gray-300 bg-gray-50 px-6 py-6 text-xl text-gray-500">
          <p>현재 매칭되는 일자리가 없습니다.</p>
          <p className="mt-2 text-lg">담당자가 직접 연락드리니 잠시만 기다려 주세요.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {validMatches.map(m => {
            const label = scoreBadgeLabel(m.score)
            return (
              <Card key={m.id} className="shadow-sm">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl font-bold text-gray-900">{m.jobs.title}</span>
                    <span className="text-lg text-gray-600">{m.jobs.region} · {m.jobs.job_type}</span>
                    <span className="text-base text-gray-400">요구 경력 {m.jobs.required_career}년</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-5 py-2 text-xl font-bold ${scoreBadgeClass(m.score)}`}
                    >
                      {m.score}점
                    </span>
                    {label && (
                      <span className="text-base font-medium text-gray-600">{label}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
