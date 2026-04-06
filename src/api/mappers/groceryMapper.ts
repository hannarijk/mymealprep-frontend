import type { ApiGroceryItem, ApiGroceryList } from '@/api/types'
import type { GroceryItem, GroceryGroup } from '@/types'

export function mapGroceryItem(api: ApiGroceryItem): GroceryItem {
  return {
    id: api.id,
    name: api.name,
    amount: api.amount,
    checked: api.checked,
    manual: api.manual,
  }
}

export function mapGroceryListToGroup(api: ApiGroceryList): GroceryGroup {
  const group: GroceryGroup = {}
  for (const [dept, items] of Object.entries(api.departments)) {
    group[dept] = items.map(mapGroceryItem)
  }
  return group
}
