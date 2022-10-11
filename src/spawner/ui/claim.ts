import { UI } from "droff-helpers"
import { CreateMessageParams, Embed } from "droff/types"
import { Candy, CandyIds } from "../../inventory/constants"

export const message = (candy: Candy): CreateMessageParams => {
  return {
    embeds: [embed(candy)],
    components: UI.grid([[button(candy.id)]]),
  }
}

export const embed = (candy: Candy): Embed => ({
  title: candy.name,
  description: "Claim the candy before anyone else!",
  fields: [
    {
      name: "Sugar points",
      value: `${candy.sugar}`,
    },
  ],
  image: { url: candy.image },
})

export const button = (id: CandyIds) =>
  UI.button({
    custom_id: `claim-${id}`,
    label: "Claim",
  })
