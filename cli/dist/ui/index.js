import chalk from "chalk";
import boxen from "boxen";
import figures from "figures";
import ora from "ora";
export const ui = {
    spinner(text) {
        return ora({
            text,
            spinner: "dots",
        });
    },
    success(text) {
        console.log(chalk.green(`${figures.tick} ${text}`));
    },
    error(text) {
        console.log(chalk.red(`${figures.cross} ${text}`));
    },
    info(text) {
        console.log(chalk.cyan(`${figures.info} ${text}`));
    },
    box(title, body) {
        console.log(boxen(`${chalk.bold(title)}\n\n${body}`, {
            padding: 1,
            borderStyle: "round",
            borderColor: "cyan",
        }));
    },
};
