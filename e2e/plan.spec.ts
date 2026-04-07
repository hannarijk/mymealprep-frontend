import { test, expect } from '@playwright/test'

test.describe('Meal Plan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/plan')
  })

  test('plan page loads and shows section headers', async ({ page }) => {
    await expect(page.getByText('Breakfast')).toBeVisible()
    await expect(page.getByText('Lunch/Dinner')).toBeVisible()
  })

  test('seeded recipes appear in the recipe library', async ({ page }) => {
    await page.getByRole('link', { name: 'Recipes' }).click()
    await expect(page).toHaveURL(/\/recipes/)
    await expect(page.getByText('E2E Oatmeal')).toBeVisible()
    await expect(page.getByText('E2E Lentil Soup')).toBeVisible()
  })

  test('adding a recipe from library appears in the plan', async ({ page }) => {
    await page.getByRole('link', { name: 'Recipes' }).click()
    await expect(page.getByText('E2E Oatmeal')).toBeVisible()

    // Click "Add to plan" on the Oatmeal card
    const oatmealCard = page.locator('.rounded-2xl').filter({ hasText: 'E2E Oatmeal' })
    await oatmealCard.getByRole('button', { name: 'Add to plan' }).click()

    // Go to plan tab and verify
    await page.getByRole('link', { name: 'Plan' }).click()
    await expect(page.getByText('E2E Oatmeal')).toBeVisible()
  })

  test('removing a recipe from the plan hides it', async ({ page }) => {
    // Add a recipe first via the library
    await page.getByRole('link', { name: 'Recipes' }).click()
    const soupCard = page.locator('.rounded-2xl').filter({ hasText: 'E2E Lentil Soup' })
    await soupCard.getByRole('button', { name: 'Add to plan' }).click()

    await page.getByRole('link', { name: 'Plan' }).click()
    await expect(page.getByText('E2E Lentil Soup')).toBeVisible()

    // Remove it
    const planCard = page.locator('.rounded-2xl').filter({ hasText: 'E2E Lentil Soup' })
    await planCard.getByRole('button').filter({ has: page.locator('svg') }).last().click()

    await expect(page.getByText('E2E Lentil Soup')).not.toBeVisible()
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
