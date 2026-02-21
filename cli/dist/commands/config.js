import chalk from "chalk";
import { setApiUrl } from "../config/config.js";
export function configSet(key, value) {
    if (key !== "api-url") {
        console.log(chalk.red("❌ Unknown config key"));
        process.exit(1);
    }
    try {
        new URL(value);
    }
    catch {
        console.log(chalk.red("❌ Invalid URL"));
        process.exit(1);
    }
    setApiUrl(value);
    console.log(chalk.green(`✅ API URL set to ${value}`));
}
