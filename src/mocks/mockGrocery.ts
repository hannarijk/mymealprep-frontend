import type { GroceryGroup } from '@/types'

export const mockGrocery: GroceryGroup = {
  Produce: [
    { id: 'prod-1', name: 'Spinach', amount: '300g', checked: false },
    { id: 'prod-2', name: 'Broccoli', amount: '2 heads', checked: false },
    { id: 'prod-3', name: 'Bell peppers', amount: '3', checked: true },
    { id: 'prod-4', name: 'Avocado', amount: '4', checked: false },
    { id: 'prod-5', name: 'Lemon', amount: '3', checked: false },
  ],
  Dairy: [
    { id: 'dairy-1', name: 'Greek yogurt', amount: '1kg', checked: false },
    { id: 'dairy-2', name: 'Eggs', amount: '12', checked: true },
    { id: 'dairy-3', name: 'Shredded cheese', amount: '200g', checked: false },
  ],
  Protein: [
    { id: 'prot-1', name: 'Chicken breasts', amount: '1.5 kg', checked: false },
    { id: 'prot-2', name: 'Salmon fillets', amount: '4', checked: false },
    { id: 'prot-3', name: 'Ground turkey', amount: '500g', checked: true },
  ],
  Pantry: [
    { id: 'pant-1', name: 'Rolled oats', amount: '1 kg', checked: false },
    { id: 'pant-2', name: 'Quinoa', amount: '500g', checked: false },
    { id: 'pant-3', name: 'Red lentils', amount: '400g', checked: false },
    { id: 'pant-4', name: 'Olive oil', amount: '1 bottle', checked: true },
  ],
}
