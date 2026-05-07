'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'

const REGIONS = ['서울', '경기', '인천', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

type FormFields = {
  name: string
  region: string
  desired_job: string
  career_years: string
}

type Errors = Partial<Record<'name' | 'region' | 'desired_job', string>>

export default function RegisterPage() {
  const [form, setForm] = useState<FormFields>({ name: '', region: '', desired_job: '', career_years: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [serverError, setServerError] = useState('')
  const [newSeniorId, setNewSeniorId] = useState('')

  function validate(): Errors {
    const errs: Errors = {}
    if (!form.name.trim()) errs.name = '이름을 입력해 주세요.'
    if (!form.region) errs.region = '지역을 선택해 주세요.'
    if (!form.desired_job) errs.desired_job = '희망 직종을 선택해 주세요.'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStatus('loading')
    setServerError('')

    const { data, error } = await supabase
      .from('seniors')
      .insert({
        name: form.name.trim(),
        region: form.region,
        desired_job: form.desired_job,
        career_years: form.career_years ? parseInt(form.career_years, 10) : 0,
      })
      .select('id')
      .single()

    if (error) {
      setServerError(error.message)
      setStatus('error')
      return
    }

    // 등록 직후 자동 매칭 점수 계산
    await supabase.rpc('rematch_senior', { p_senior_id: data.id })

    setNewSeniorId(data.id)
    setStatus('success')
    setForm({ name: '', region: '', desired_job: '', career_years: '' })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">시니어 일자리 신청하기</h1>
        <p className="mt-2 text-xl text-gray-600">
          정보를 입력하시면 맞는 일자리를 자동으로 찾아드립니다.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">기본 정보 입력</CardTitle>
          <CardDescription className="text-lg">
            * 표시된 항목은 필수 입력 항목입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="mb-6 flex flex-col gap-4 rounded-lg border border-green-400 bg-green-100 px-6 py-5">
              <p className="text-xl font-semibold text-green-800">
                등록이 완료되었습니다. 담당자가 곧 연락드립니다.
              </p>
              <a
                href={`/recommendations?senior_id=${newSeniorId}`}
                className="inline-block rounded-lg bg-green-700 px-6 py-3 text-xl font-bold text-white hover:bg-green-800 text-center"
              >
                내 추천 일자리 보기 →
              </a>
            </div>
          )}
          {status === 'error' && (
            <div className="mb-6 rounded-lg border border-red-400 bg-red-100 px-6 py-4 text-lg text-red-800">
              저장 중 오류가 발생했습니다: {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xl font-semibold">이름 *</Label>
              <p className="text-lg text-gray-500">성함을 알려주세요.</p>
              {errors.name && (
                <div className="rounded border border-red-400 bg-red-100 px-4 py-2 text-lg font-medium text-red-800">
                  {errors.name}
                </div>
              )}
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="홍길동"
                className="h-14 text-xl px-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xl font-semibold">지역 *</Label>
              <p className="text-lg text-gray-500">어디에서 일하고 싶으세요?</p>
              {errors.region && (
                <div className="rounded border border-red-400 bg-red-100 px-4 py-2 text-lg font-medium text-red-800">
                  {errors.region}
                </div>
              )}
              <Select
                value={form.region || null}
                onValueChange={v => setForm(f => ({ ...f, region: v ?? '' }))}
              >
                <SelectTrigger className="h-14 text-xl w-full">
                  <SelectValue placeholder="지역을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(r => (
                    <SelectItem key={r} value={r} className="text-xl py-3">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xl font-semibold">희망 직종 *</Label>
              <p className="text-lg text-gray-500">어떤 일을 하시겠어요?</p>
              {errors.desired_job && (
                <div className="rounded border border-red-400 bg-red-100 px-4 py-2 text-lg font-medium text-red-800">
                  {errors.desired_job}
                </div>
              )}
              <Select
                value={form.desired_job || null}
                onValueChange={v => setForm(f => ({ ...f, desired_job: v ?? '' }))}
              >
                <SelectTrigger className="h-14 text-xl w-full">
                  <SelectValue placeholder="직종을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(j => (
                    <SelectItem key={j} value={j} className="text-xl py-3">{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="career_years" className="text-xl font-semibold">경력 연수</Label>
              <p className="text-lg text-gray-500">관련 경력이 몇 년 되셨나요?</p>
              <Input
                id="career_years"
                type="number"
                min={0}
                value={form.career_years}
                onChange={e => setForm(f => ({ ...f, career_years: e.target.value }))}
                placeholder="예: 5"
                className="h-14 text-xl px-4"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-16 text-xl font-bold mt-2"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? '저장 중…' : '등록하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
