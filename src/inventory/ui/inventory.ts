import { Embed, EmbedField } from "droff/types"
import { Inventory } from "../../types"
import { CandyIds, candyTypeMap } from "../constants"

export const embed = (inventory: Inventory): Embed => {
  const keys = Object.keys(inventory)
  keys.sort()
  return {
    title: "Your candy",
    fields: [
      ...keys
        .filter((id): id is CandyIds => Object.hasOwn(candyTypeMap, id))
        .map((id) => field(id, inventory[id])),
      totalField(inventory),
    ],
  }
}

const field = (id: CandyIds, count: number): EmbedField => {
  const candy = candyTypeMap[id]

  return {
    name: `${candy.name} x${count}`,
    value: `Sugar points: ${count * candy.sugar}`,
  }
}

const totalSugarPoints = (i: Inventory) =>
  Object.entries(i).reduce((total, [id, count]) => {
    const candy = candyTypeMap[id as CandyIds]
    if (!candy) return total
    return total + candy.sugar * count
  }, 0)

const totalField = (i: Inventory): EmbedField => ({
  name: "Total sugar points",
  value: `${totalSugarPoints(i)}`,
})
