import chalk from "chalk"
import boxen from "boxen"
import figures from "figures"
import ora from "ora"

export const ui = {
  spinner(text: string) {
    return ora({
      text,
      spinner: "dots",
    })
  },

  success(text: string) {
    console.log(chalk.green(`${figures.tick} ${text}`))
  },

  error(text: string) {
    console.log(chalk.red(`${figures.cross} ${text}`))
  },

  info(text: string) {
    console.log(chalk.cyan(`${figures.info} ${text}`))
  },

  box(title: string, body: string) {
    console.log(
      boxen(
        `${chalk.bold(title)}\n\n${body}`,
        {
          padding: 1,
          borderStyle: "round",
          borderColor: "cyan",
        }
      )
    )
  },
}