import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = 'http://localhost:5173'
const API_URL = 'http://localhost:8080/api/v1'
const AUTH_DIR = path.join(process.cwd(), 'e2e', '.auth')

export default async function globalSetup() {
  // Register a unique test user
  const email = `test+${Date.now()}@example.com`
  const password = 'testpassword123'

  const authRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!authRes.ok) {
    throw new Error(
      `Failed to register test user: ${authRes.status}. Is the backend running on port 8080?`,
    )
  }

  const { token } = await authRes.json()

  // Seed test recipes
  const seedRecipes = [
    {
      name: 'E2E Oatmeal',
      section: 'Breakfast',
      tags: ['quick'],
      timeMinutes: 10,
      servings: 1,
      why: 'Great for mornings',
      imageUrl: 'https://placehold.co/400x300',
      steps: ['Cook oats', 'Add toppings'],
      ingredients: [{ name: 'Oats', amount: '100g', department: 'Grains' }],
    },
    {
      name: 'E2E Lentil Soup',
      section: 'Lunch/Dinner',
      tags: ['hearty'],
      timeMinutes: 45,
      servings: 4,
      why: 'Nutritious and filling',
      imageUrl: 'https://placehold.co/400x300',
      steps: ['Boil lentils', 'Add vegetables'],
      ingredients: [{ name: 'Lentils', amount: '200g', department: 'Legumes' }],
    },
    {
      name: 'E2E Chicken Bowl',
      section: 'Lunch/Dinner',
      tags: ['protein'],
      timeMinutes: 30,
      servings: 2,
      why: 'High protein',
      imageUrl: 'https://placehold.co/400x300',
      steps: ['Cook chicken', 'Assemble bowl'],
      ingredients: [{ name: 'Chicken', amount: '300g', department: 'Meat' }],
    },
  ]

  const recipeIds: string[] = []
  for (const recipe of seedRecipes) {
    const res = await fetch(`${API_URL}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(recipe),
    })
    if (res.ok) {
      const data = await res.json()
      recipeIds.push(data.id)
    }
  }

  // Persist setup data for tests
  fs.mkdirSync(AUTH_DIR, { recursive: true })
  fs.writeFileSync(
    path.join(AUTH_DIR, 'setup.json'),
    JSON.stringify({ email, password, token, recipeIds }, null, 2),
  )

  // Save browser auth state (localStorage token) for authenticated test projects
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(`${BASE_URL}/login`)
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token)
  await context.storageState({ path: path.join(AUTH_DIR, 'user.json') })
  await browser.close()
}
