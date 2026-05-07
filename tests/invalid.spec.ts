/**
 * 실패 시나리오: 이름 비워두고 제출 → 빨간 에러 박스 표시 / DB에 시니어 미저장 확인
 */
import { test, expect } from '@playwright/test'
import { resetDb, supabase } from './helpers/db'

test.beforeEach(async () => {
  await resetDb()
})

test('이름 없이 제출하면 에러 박스가 표시되고 DB에 저장되지 않는다', async ({ page }) => {
  await page.goto('/register')

  // 이름 비움 (기본값 '' 유지)

  // 지역 선택 (서울)
  await page.getByRole('combobox').nth(0).click()
  await page.getByRole('option', { name: '서울' }).click()

  // 희망 직종 선택 (경비)
  await page.getByRole('combobox').nth(1).click()
  await page.getByRole('option', { name: '경비' }).click()

  // 경력 연수 입력
  await page.locator('#career_years').fill('3')

  // 등록하기 제출
  await page.getByRole('button', { name: '등록하기' }).click()

  // 이름 필드 위 빨간 안내 박스 확인
  await expect(page.getByText('이름을 입력해 주세요.')).toBeVisible()

  // DB에 새 시니어가 없는지 확인 (beforeEach에서 전체 삭제 후 추가 없음)
  const { count, error } = await supabase
    .from('seniors')
    .select('*', { count: 'exact', head: true })
  expect(error).toBeNull()
  expect(count).toBe(0)
})
