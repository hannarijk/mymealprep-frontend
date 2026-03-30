import type { GroceryGroup } from '@/types'

export const mockGrocery: GroceryGroup = {
  Produce: [
    { name: 'Spinach', amount: '300g', checked: false },
    { name: 'Broccoli', amount: '2 heads', checked: false },
    { name: 'Bell peppers', amount: '3', checked: true },
    { name: 'Avocado', amount: '4', checked: false },
    { name: 'Lemon', amount: '3', checked: false },
  ],
  Dairy: [
    { name: 'Greek yogurt', amount: '1kg', checked: false },
    { name: 'Eggs', amount: '12', checked: true },
    { name: 'Shredded cheese', amount: '200g', checked: false },
  ],
  Protein: [
    { name: 'Chicken breasts', amount: '1.5 kg', checked: false },
    { name: 'Salmon fillets', amount: '4', checked: false },
    { name: 'Ground turkey', amount: '500g', checked: true },
  ],
  Pantry: [
    { name: 'Rolled oats', amount: '1 kg', checked: false },
    { name: 'Quinoa', amount: '500g', checked: false },
    { name: 'Red lentils', amount: '400g', checked: false },
    { name: 'Olive oil', amount: '1 bottle', checked: true },
  ],
}
