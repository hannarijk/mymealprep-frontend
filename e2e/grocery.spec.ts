import { test, expect } from '@playwright/test'

test.describe('Grocery List', () => {
  test.beforeEach(async ({ page }) => {
    // Add a recipe to the plan so the grocery list has items
    await page.goto('/recipes')
    await expect(page.getByText('E2E Oatmeal')).toBeVisible()
    const oatmealCard = page.locator('.rounded-2xl').filter({ hasText: 'E2E Oatmeal' })
    await oatmealCard.getByRole('button', { name: 'Add to plan' }).click()
    await page.goto('/grocery')
  })

  test('grocery tab shows items after adding recipes to plan', async ({ page }) => {
    // At least one item should be visible (Oats from E2E Oatmeal)
    await expect(page.locator('li, [role="listitem"]').first()).toBeVisible()
  })

  test('checking an item marks it visually', async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    await expect(firstCheckbox).not.toBeChecked()
    await firstCheckbox.click()
    await expect(firstCheckbox).toBeChecked()
  })

  test('checked state persists on reload', async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    await firstCheckbox.click()
    await expect(firstCheckbox).toBeChecked()

    await page.reload()
    await page.goto('/grocery')
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked()
  })

  test('manually added item appears in the list', async ({ page }) => {
    const initialCount = await page.locator('input[type="checkbox"]').count()

    // Find the add-item input and submit
    const addInput = page.locator('input[placeholder*="item" i], input[placeholder*="add" i]').first()
    await addInput.fill('Test manual item')
    await addInput.press('Enter')

    await expect(page.locator('input[type="checkbox"]')).toHaveCount(initialCount + 1)
    await expect(page.getByText('Test manual item')).toBeVisible()
  })
})
