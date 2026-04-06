import { client } from '@/api/client'
import { ApiError } from '@/api/client'
import { mapGroceryItem, mapGroceryListToGroup } from '@/api/mappers/groceryMapper'
import type { ApiGroceryItem, ApiGroceryList } from '@/api/types'
import type { GroceryGroup, GroceryItem } from '@/types'

export async function fetchGrocery(): Promise<GroceryGroup> {
  try {
    const res = await client.get<ApiGroceryList>('/grocery')
    return mapGroceryListToGroup(res)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return {}
    }
    throw e
  }
}

export async function toggleGroceryItem(id: string, checked: boolean): Promise<void> {
  await client.patch(`/grocery/items/${id}`, { checked })
}

export async function removeGroceryItem(id: string): Promise<void> {
  await client.delete(`/grocery/items/${id}`)
}

export async function addGroceryItem(
  name: string,
  amount: string,
  department: string,
): Promise<GroceryItem> {
  const res = await client.post<ApiGroceryItem>('/grocery/items', { name, amount, department })
  return mapGroceryItem(res)
}
