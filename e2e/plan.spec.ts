import { test, expect, type Page } from '@playwright/test'

async function gotoRecipes(page: Page) {
  // Hard navigation so Playwright waits for full page load before networkidle check.
  // SPA link clicks return before onMounted fires, causing a race with the recipe fetch.
  await page.goto('/recipes')
  await page.waitForLoadState('networkidle')
}

async function addToPlan(page: Page, recipeName: string) {
  const card = page.locator('.rounded-2xl').filter({ hasText: recipeName })
  // Wait for the plan PUT to complete so the server has the updated plan
  // before we navigate away and re-fetch it.
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/meal-plans/') && r.request().method() === 'PUT'),
    card.getByRole('button', { name: 'Add to plan' }).click(),
  ])
}

test.describe('Meal Plan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/plan')
  })

  test('plan page loads and shows section headers', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Breakfast' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Lunch / Dinner' })).toBeVisible()
  })

  test('seeded recipes appear in the recipe library', async ({ page }) => {
    await gotoRecipes(page)
    await expect(page.getByText('E2E Oatmeal')).toBeVisible()
    await expect(page.getByText('E2E Lentil Soup')).toBeVisible()
  })

  test('adding a recipe from library appears in the plan', async ({ page }) => {
    await gotoRecipes(page)
    await addToPlan(page, 'E2E Oatmeal')

    await page.goto('/plan')
    await expect(page.getByText('E2E Oatmeal')).toBeVisible()
  })

  test('removing a recipe from the plan hides it from plan sections', async ({ page }) => {
    await gotoRecipes(page)
    await addToPlan(page, 'E2E Lentil Soup')

    await page.goto('/plan')
    await expect(page.getByText('E2E Lentil Soup')).toBeVisible()

    // SectionMealCard has exactly one button (the Trash2 delete button)
    const planCard = page
      .locator('section')
      .locator('.rounded-2xl')
      .filter({ hasText: 'E2E Lentil Soup' })
      .first()
    await planCard.locator('button').click()

    // After removal the recipe may reappear in suggestions, but must be gone from plan sections
    await expect(
      page.locator('section').filter({ hasText: 'E2E Lentil Soup' }),
    ).toHaveCount(0)
  })

  test('plan type toggle switches between Weekly and Biweekly', async ({ page }) => {
    const toggle = page.locator('button').filter({ hasText: /Weekly|Biweekly/ })
    await expect(toggle).toContainText('Weekly')
    await toggle.click()
    await expect(toggle).toContainText('Biweekly')
    await toggle.click()
    await expect(toggle).toContainText('Weekly')
  })
})
