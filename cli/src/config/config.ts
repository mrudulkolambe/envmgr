import fs from "fs"
import os from "os"
import path from "path"

const CONFIG_DIR = path.join(os.homedir(), ".envmgr")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

type Config = {
  token?: string
  apiUrl?: string
}

function readConfig(): Config {
  if (!fs.existsSync(CONFIG_FILE)) return {}
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))
}

function writeConfig(config: Config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

export function saveToken(token: string) {
  const config = readConfig()
  writeConfig({ ...config, token })
}

export function getToken(): string | null {
  return readConfig().token ?? null
}

export function clearToken() {
  const config = readConfig()
  delete config.token
  writeConfig(config)
}

export function setApiUrl(apiUrl: string) {
  const config = readConfig()
  writeConfig({ ...config, apiUrl })
}

export function getApiUrl(): string | null {
  return readConfig().apiUrl ?? null
}

export function clearAll() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE)
  }
}