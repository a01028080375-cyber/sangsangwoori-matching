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

export default async function RecommendationsPage({ searchParams }: Props) {
  const { senior_id } = await searchParams

  if (!senior_id) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-gray-900">추천 일자리 목록</h1>
        <div className="rounded-lg border border-yellow-400 bg-yellow-50 px-6 py-5 text-xl text-yellow-800">
          URL에 <code className="font-mono">?senior_id=</code> 파라미터가 필요합니다.
        </div>
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
        <h1 className="text-4xl font-bold text-gray-900">추천 일자리 목록</h1>
        {senior && (
          <p className="mt-2 text-xl text-gray-600">
            {senior.name}님 ({senior.region} · {senior.desired_job}) 맞춤 추천입니다.
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
          현재 매칭되는 일자리가 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {validMatches.map(m => (
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
