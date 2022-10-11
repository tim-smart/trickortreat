import { Embed } from "droff/types"
import { TopUser } from "../inventory/repos/items"

export const embed = (users: TopUser[]): Embed => ({
  title: "Trick-or-treat leaderboard",
  fields: users.map((user, index) => ({
    name: `#${index + 1} - ${user.points} sugar points`,
    value: `**<@${user._id}>**`,
  })),
})
