import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const setupPath = path.join(process.cwd(), 'e2e', '.auth', 'setup.json')

test.describe('Authentication', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/plan')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirect preserves the original destination', async ({ page }) => {
    await page.goto('/grocery')
    await expect(page).toHaveURL(/\/login\?redirect=\/grocery/)
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('p.text-rose-600')).toBeVisible()
  })

  test('login with correct credentials lands on /plan', async ({ page }) => {
    const setup = JSON.parse(fs.readFileSync(setupPath, 'utf-8'))
    await page.goto('/login')
    await page.fill('input[type="email"]', setup.email)
    await page.fill('input[type="password"]', setup.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/plan/)
  })

  test('register with new email lands on /plan', async ({ page }) => {
    const email = `e2e+register+${Date.now()}@example.com`
    await page.goto('/register')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'newpassword123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/plan/)
  })

  test('authenticated user visiting /login is redirected to /plan', async ({ page }) => {
    // Log in first
    const setup = JSON.parse(fs.readFileSync(setupPath, 'utf-8'))
    await page.goto('/login')
    await page.fill('input[type="email"]', setup.email)
    await page.fill('input[type="password"]', setup.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/plan/)

    // Visiting /login again should redirect back to /plan
    await page.goto('/login')
    await expect(page).toHaveURL(/\/plan/)
  })

  test('logout redirects to /login', async ({ page }) => {
    const setup = JSON.parse(fs.readFileSync(setupPath, 'utf-8'))
    await page.goto('/login')
    await page.fill('input[type="email"]', setup.email)
    await page.fill('input[type="password"]', setup.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/plan/)

    await page.click('button[title="Log out"]')
    await expect(page).toHaveURL(/\/login/)

    // Protected route should redirect again
    await page.goto('/plan')
    await expect(page).toHaveURL(/\/login/)
  })
})
