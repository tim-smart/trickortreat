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
    id: "reeses",
    name: "Reese's",
    prefix: "some",
    sugar: 7,
    image:
      "https://cdn.shopify.com/s/files/1/0273/8330/0207/products/2065_Reeses_2_Peanut_Butter_Cups_1.5oz_c65b567b-2429-4f35-8142-1c0fa7dd175f_900x.jpg?v=1660809042",
    frequency: 2,
  },
  {
    id: "skittles",
    name: "Skittles",
    prefix: "some",
    sugar: 7,
    image:
      "https://compote.slate.com/images/79fb3cf9-c3a6-403c-b29a-d9bb6f086a36.jpeg?crop=1560%2C1040%2Cx0%2Cy0&width=960",
    frequency: 2,
  },
  {
    id: "sour-grape",
    name: "Sour grapes",
    prefix: "some",
    sugar: 4,
    image:
      "https://cdn.shopify.com/s/files/1/0580/5945/6680/products/Mayceys-Sour-Grape-Lollies-Mayceys-Candy-Co-1646903840_900x900.jpg?v=1663636123",
    frequency: 4,
  },
  {
    id: "cola-fizz",
    name: "Cola fizz",
    prefix: "some",
    sugar: 3,
    image:
      "https://www.daffydowndilly.co.uk/wp-content/uploads/2015/03/Giant-Fizzy-Cola-Bottles.jpg",
    frequency: 5,
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
