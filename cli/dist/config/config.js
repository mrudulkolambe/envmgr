import fs from "fs";
import os from "os";
import path from "path";
const CONFIG_DIR = path.join(os.homedir(), ".envmgr");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
function readConfig() {
    if (!fs.existsSync(CONFIG_FILE))
        return {};
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
}
function writeConfig(config) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
export function saveToken(token) {
    const config = readConfig();
    writeConfig({ ...config, token });
}
export function getToken() {
    return readConfig().token ?? null;
}
export function clearToken() {
    const config = readConfig();
    delete config.token;
    writeConfig(config);
}
export function setApiUrl(apiUrl) {
    const config = readConfig();
    writeConfig({ ...config, apiUrl });
}
export function getApiUrl() {
    return readConfig().apiUrl ?? null;
}
export function clearAll() {
    if (fs.existsSync(CONFIG_FILE)) {
        fs.unlinkSync(CONFIG_FILE);
    }
}
