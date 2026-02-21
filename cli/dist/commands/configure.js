import { confirm, input } from "@inquirer/prompts";
import { ui } from "../ui/index.js";
import { setApiUrl } from "../config/config.js";
import { DEFAULT_API_URL } from "../constants.js";
export async function configure() {
    ui.box("EnvMgr CLI Setup", "Let’s get you connected 🚀");
    const isSelfHosted = await confirm({
        message: "Is this a self-hosted EnvMgr instance?",
        default: false,
    });
    if (!isSelfHosted) {
        setApiUrl(DEFAULT_API_URL);
        ui.success("Using default EnvMgr API");
        return;
    }
    const apiUrl = await input({
        message: "Enter API URL:",
        validate(value) {
            try {
                new URL(value);
                return true;
            }
            catch {
                return "Please enter a valid URL";
            }
        },
    });
    setApiUrl(apiUrl);
    ui.success("Configuration saved");
}
