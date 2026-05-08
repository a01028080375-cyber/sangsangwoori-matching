'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import type { Job } from '@/types'

const REGIONS = ['서울', '경기', '인천', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

type JobForm = {
  title: string
  region: string
  job_type: string
  required_career: string
}

export function JobsManager() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [form, setForm] = useState<JobForm>({ title: '', region: '', job_type: '', required_career: '' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setJobs(data ?? [])
  }

  useEffect(() => { fetchJobs() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.region || !form.job_type) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: form.title.trim(),
        region: form.region,
        job_type: form.job_type,
        required_career: form.required_career ? parseInt(form.required_career, 10) : 0,
      })
      .select('id')
      .single()

    if (!error && data) {
      // 일자리 등록 직후 자동 매칭 점수 재계산
      await supabase.rpc('rematch_job', { p_job_id: data.id })
    }

    setForm({ title: '', region: '', job_type: '', required_career: '' })
    await fetchJobs()
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('jobs').delete().eq('id', id)
    setJobs(prev => prev.filter(j => j.id !== id))
    setConfirmingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">일자리 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xl font-semibold">공고명 *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="예: 아파트 경비원 모집"
                className="h-14 text-xl px-4"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xl font-semibold">지역 *</Label>
                <Select
                  value={form.region || null}
                  onValueChange={v => setForm(f => ({ ...f, region: v ?? '' }))}
                >
                  <SelectTrigger className="h-14 text-xl w-full">
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => (
                      <SelectItem key={r} value={r} className="text-xl py-3">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xl font-semibold">직종 *</Label>
                <Select
                  value={form.job_type || null}
                  onValueChange={v => setForm(f => ({ ...f, job_type: v ?? '' }))}
                >
                  <SelectTrigger className="h-14 text-xl w-full">
                    <SelectValue placeholder="직종 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map(j => (
                      <SelectItem key={j} value={j} className="text-xl py-3">{j}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xl font-semibold">요구 경력(년)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.required_career}
                  onChange={e => setForm(f => ({ ...f, required_career: e.target.value }))}
                  placeholder="예: 3"
                  className="h-14 text-xl px-4"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-14 text-xl font-bold"
              disabled={submitting}
            >
              {submitting ? '저장 중…' : '일자리 등록'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">등록된 일자리 ({jobs.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="py-4 text-xl text-gray-400">등록된 일자리가 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg font-bold">공고명</TableHead>
                  <TableHead className="text-lg font-bold">지역</TableHead>
                  <TableHead className="text-lg font-bold">직종</TableHead>
                  <TableHead className="text-lg font-bold">요구경력</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell className="text-lg">{job.title}</TableCell>
                    <TableCell className="text-lg">{job.region}</TableCell>
                    <TableCell className="text-lg">{job.job_type}</TableCell>
                    <TableCell className="text-lg">{job.required_career}년</TableCell>
                    <TableCell>
                      {confirmingId === job.id ? (
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            className="h-12 text-base font-bold"
                            onClick={() => handleDelete(job.id)}
                          >
                            삭제 확인
                          </Button>
                          <Button
                            variant="outline"
                            className="h-12 text-base"
                            onClick={() => setConfirmingId(null)}
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="destructive"
                          className="h-12 text-base font-semibold"
                          onClick={() => setConfirmingId(job.id)}
                        >
                          삭제
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
