export const candyTypes = [
  {
    id: "cola-fizz",
    name: "Cola fizz",
    sugar: 3,
  },
  {
    id: "milk-bottle",
    name: "Milk bottle",
    sugar: 1,
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
