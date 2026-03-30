import { mockGrocery } from '@/mocks/mockGrocery'
import type { GroceryGroup } from '@/types'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function fetchGrocery(): Promise<GroceryGroup> {
  await delay()
  return structuredClone(mockGrocery)
}

export async function updateGrocery(_grocery: GroceryGroup): Promise<void> {
  await delay()
}
