import { test, expect, type Page } from '@playwright/test'

async function addOatmealToPlan(page: Page) {
  await page.goto('/recipes')
  await page.waitForLoadState('networkidle')

  const oatmealCard = page.locator('.rounded-2xl').filter({ hasText: 'E2E Oatmeal' })
  // Wait for the plan PUT to complete before navigating; the grocery regeneration
  // (POST /grocery/regenerate) is fire-and-forget from that same request handler.
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/meal-plans/') && r.request().method() === 'PUT'),
    oatmealCard.getByRole('button', { name: 'Add to plan' }).click(),
  ])
}

test.describe('Grocery List', () => {
  test.beforeEach(async ({ page }) => {
    await addOatmealToPlan(page)
    await page.goto('/grocery')
    await page.waitForLoadState('networkidle')
  })

  test('grocery tab shows items after adding recipes to plan', async ({ page }) => {
    await expect(page.locator('li').first()).toBeVisible({ timeout: 10_000 })
  })

  test('checking an item marks it visually', async ({ page }) => {
    const firstToggle = page.locator('li').first().locator('button').first()
    await expect(firstToggle).not.toHaveClass(/bg-emerald-500/)
    await firstToggle.click()
    await expect(firstToggle).toHaveClass(/bg-emerald-500/)
  })

  test('checked state persists on reload', async ({ page }) => {
    const firstToggle = page.locator('li').first().locator('button').first()
    await firstToggle.click()
    await expect(firstToggle).toHaveClass(/bg-emerald-500/)

    await page.goto('/grocery')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('li').first().locator('button').first()).toHaveClass(/bg-emerald-500/)
  })

  test('manually added item appears in the list', async ({ page }) => {
    const initialCount = await page.locator('li').count()

    const addInput = page.locator('input[placeholder="Add item…"]').first()
    await addInput.fill('Test manual item')
    await addInput.press('Enter')

    await expect(page.locator('li')).toHaveCount(initialCount + 1, { timeout: 10_000 })
    await expect(page.getByText('Test manual item')).toBeVisible()
  })
})
