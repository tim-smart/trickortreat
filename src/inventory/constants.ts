export const candyTypes = [
  {
    id: "choc-bar",
    name: "Chocolate bar",
    prefix: "a",
    sugar: 10,
    image:
      "https://images.squarespace-cdn.com/content/v1/5e9423c8fbecac6e4401c7e9/140ee311-d721-4aa2-811c-83bfe6e48f0a/expiration+date+of+chocolate+bars?format=500w",
    frequency: 1,
  },
  {
    id: "sour-grape",
    name: "Sour grapes",
    prefix: "some",
    sugar: 5,
    image:
      "https://cdn.shopify.com/s/files/1/0580/5945/6680/products/Mayceys-Sour-Grape-Lollies-Mayceys-Candy-Co-1646903840_900x900.jpg?v=1663636123",
    frequency: 2,
  },
  {
    id: "cola-fizz",
    name: "Cola fizz",
    prefix: "some",
    sugar: 3,
    image:
      "https://www.daffydowndilly.co.uk/wp-content/uploads/2015/03/Giant-Fizzy-Cola-Bottles.jpg",
    frequency: 3,
  },
  {
    id: "milk-bottle",
    name: "Milk bottles",
    prefix: "some",
    sugar: 1,
    image:
      "https://cdn.shopify.com/s/files/1/0366/8685/6236/products/milk-bottles-firm-gummies-jellies-pik-mix-lollies-nz-787_800x.png?v=1624525723",
    frequency: 10,
  },
] as const

export type Candy = typeof candyTypes[number]
export type CandyIds = Candy["id"]

export const candyTypeMap = candyTypes.reduce(
  (acc, candy) => ({
    ...acc,
    [candy.id]: candy,
  }),
  {} as { [K in Candy["id"]]: Extract<Candy, { id: K }> }
)

export const candyFrequencyArray = candyTypes.flatMap((candy) => {
  return Array.from({ length: candy.frequency }, () => candy)
}) as Candy[]
