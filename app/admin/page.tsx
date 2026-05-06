import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { JobsManager } from './JobsManager'
import { supabase } from '@/lib/supabase'

type SeniorRow = {
  id: string
  name: string
  region: string
  desired_job: string
}

type MatchSummary = {
  senior_id: string
  score: number
  status: string
}

function deriveSeniorStatus(seniorMatches: MatchSummary[]): 'unmatched' | 'pending' | 'assigned' {
  if (seniorMatches.some(m => m.status === 'assigned' || m.status === 'done')) return 'assigned'
  if (seniorMatches.some(m => m.score > 0)) return 'pending'
  return 'unmatched'
}

const STATUS_LABEL: Record<string, string> = {
  unmatched: '미매칭',
  pending: '매칭 대기',
  assigned: '배정 완료',
}

const STATUS_BADGE: Record<string, string> = {
  unmatched: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-green-100 text-green-700',
}

export default async function AdminPage() {
  const [{ data: seniors }, { data: allMatches }] = await Promise.all([
    supabase.from('seniors').select('id, name, region, desired_job').order('name'),
    supabase.from('matches').select('senior_id, score, status'),
  ])

  const matchesBySenior = new Map<string, MatchSummary[]>()
  for (const m of (allMatches ?? []) as MatchSummary[]) {
    if (!matchesBySenior.has(m.senior_id)) matchesBySenior.set(m.senior_id, [])
    matchesBySenior.get(m.senior_id)!.push(m)
  }

  const seniorsWithStats = ((seniors ?? []) as SeniorRow[]).map(s => {
    const sMatches = matchesBySenior.get(s.id) ?? []
    const bestScore = sMatches.length > 0 ? Math.max(...sMatches.map(m => m.score)) : 0
    const derivedStatus = deriveSeniorStatus(sMatches)
    return { ...s, bestScore, derivedStatus }
  })

  const unmatchedCount = seniorsWithStats.filter(s => s.derivedStatus === 'unmatched').length
  const pendingCount   = seniorsWithStats.filter(s => s.derivedStatus === 'pending').length
  const assignedCount  = seniorsWithStats.filter(s => s.derivedStatus === 'assigned').length

  const SUMMARY_CARDS = [
    { label: '미매칭', count: unmatchedCount, badgeClass: 'bg-red-100 text-red-700' },
    { label: '매칭 대기', count: pendingCount, badgeClass: 'bg-yellow-100 text-yellow-700' },
    { label: '배정 완료', count: assignedCount, badgeClass: 'bg-green-100 text-green-700' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">담당자 대시보드</h1>
        <p className="mt-2 text-xl text-gray-600">
          매칭 현황을 단계별로 확인하고 관리합니다.
        </p>
      </div>

      {/* 집계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {SUMMARY_CARDS.map(({ label, count, badgeClass }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
              <Badge className={`text-lg px-4 py-1 ${badgeClass}`}>{label}</Badge>
              <span className="text-5xl font-bold text-gray-900">{count}</span>
              <span className="text-lg text-gray-500">명</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 시니어 목록 테이블 */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">시니어 목록 ({seniorsWithStats.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          {seniorsWithStats.length === 0 ? (
            <p className="py-4 text-xl text-gray-400">등록된 시니어가 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg font-bold">이름</TableHead>
                  <TableHead className="text-lg font-bold">지역</TableHead>
                  <TableHead className="text-lg font-bold">희망 직종</TableHead>
                  <TableHead className="text-lg font-bold">최고 점수</TableHead>
                  <TableHead className="text-lg font-bold">상태</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {seniorsWithStats.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-lg font-semibold">{s.name}</TableCell>
                    <TableCell className="text-lg">{s.region}</TableCell>
                    <TableCell className="text-lg">{s.desired_job}</TableCell>
                    <TableCell className="text-lg font-bold">{s.bestScore}점</TableCell>
                    <TableCell>
                      <Badge className={`text-base px-3 py-1 ${STATUS_BADGE[s.derivedStatus]}`}>
                        {STATUS_LABEL[s.derivedStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/recommendations?senior_id=${s.id}`}
                        className={buttonVariants({ size: 'sm', className: 'text-base' })}
                      >
                        상세 보기
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 일자리 관리 섹션 */}
      <div>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">일자리 관리</h2>
        <JobsManager />
      </div>
    </div>
  )
}
