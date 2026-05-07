/**
 * 엣지 시나리오: 매칭 안 되는 공고만 있을 때 "현재 매칭되는 일자리가 없습니다" 안내 박스 확인
 *
 * 공고: 기타/기타/required_career=10
 * 시니어: 서울/경비/career_years=3
 *
 * 점수 산정:
 *   - 지역 불일치(서울 vs 기타): 0점
 *   - 직종 불일치(경비 vs 기타): 0점
 *   - 경력 미달(3 < 10):         0점
 *   합계: 0점 → validMatches 필터(score > 0) 통과 못해 안내 박스 표시
 *
 * Note: required_career=0 이면 경력 점수 1점이 붙어 매칭으로 오인되므로,
 * 모든 조건이 완전히 불일치하도록 required_career=10 을 사용함.
 */
import { test, expect } from '@playwright/test'
import { resetDb, insertJob } from './helpers/db'

test.beforeEach(async () => {
  await resetDb()
  // 서울/경비 시니어와 지역·직종·경력 모두 불일치하는 공고
  await insertJob({
    title: '기타 업무',
    region: '기타',
    job_type: '기타',
    required_career: 10,
  })
})

test('매칭되는 일자리가 없으면 안내 메시지가 표시된다', async ({ page }) => {
  await page.goto('/register')

  await page.locator('#name').fill('노매칭시니어')

  // 지역: 서울
  await page.getByRole('combobox').nth(0).click()
  await page.getByRole('option', { name: '서울' }).click()

  // 직종: 경비
  await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: '경비' }).click()

  // 경력: 3년
  await page.locator('#career_years').fill('3')

  // 등록하기
  await page.getByRole('button', { name: '등록하기' }).click()

  // 성공 박스 확인 후 추천 페이지로 이동
  await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 })
  await page.getByRole('link', { name: /내 추천 일자리 보기/ }).click()

  // 매칭 없음 안내 박스 확인
  await expect(page.getByText('현재 매칭되는 일자리가 없습니다.')).toBeVisible({ timeout: 10_000 })
})
