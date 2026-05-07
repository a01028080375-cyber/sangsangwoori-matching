/**
 * 정상 시나리오: 서울/경비/5년 시니어 등록 → 서울/경비/요구경력3년 공고와 매칭 → 6점 금색 배지 표시
 * 점수 산정: 지역 일치(+3) + 직종 일치(+2) + 경력 충족(+1) = 6점
 */
import { test, expect } from '@playwright/test'
import { resetDb, insertJob } from './helpers/db'

test.beforeEach(async () => {
  await resetDb()
  await insertJob({
    title: '아파트 경비원 모집',
    region: '서울',
    job_type: '경비',
    required_career: 3,
  })
})

test('시니어 등록 후 6점 금색 배지 추천 카드가 상단에 표시된다', async ({ page }) => {
  await page.goto('/register')

  // 이름 입력
  await page.locator('#name').fill('테스트시니어')

  // 지역 선택 (첫 번째 combobox = 지역)
  await page.getByRole('combobox').nth(0).click()
  await page.getByRole('option', { name: '서울' }).click()

  // 희망 직종 선택 (두 번째 combobox = 희망 직종)
  await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: '경비' }).click()

  // 경력 연수 입력 (5년 → 5 >= 3 이므로 경력 점수 +1 획득)
  await page.locator('#career_years').fill('5')

  // 등록하기 제출
  await page.getByRole('button', { name: '등록하기' }).click()

  // 초록색 성공 박스 확인
  await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 })

  // 추천 일자리 보기 링크 클릭 → /recommendations?senior_id={id} 로 이동
  await page.getByRole('link', { name: /내 추천 일자리 보기/ }).click()

  // 6점 금색 배지 확인 (score >= 6 → bg-yellow-400)
  const badge = page.locator('.bg-yellow-400').filter({ hasText: '6점' })
  await expect(badge).toBeVisible({ timeout: 10_000 })
})
