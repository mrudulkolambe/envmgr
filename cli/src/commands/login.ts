import { input, password } from "@inquirer/prompts"
import { ui } from "../ui/index.js"
import { saveToken } from "../config/config.js"
import { requireApiConfig } from "../config/guard.js"

export async function login() {
  const apiUrl = requireApiConfig()

  const email = await input({
    message: "Email:",
  })

  const pass = await password({
    message: "Password:",
    mask: "•",
  })

  const spinner = ui.spinner("Logging in…").start()

  try {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: pass,
        client: "cli",
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      spinner.fail("Login failed")
      ui.error(data.message)
      process.exit(1)
    }

    saveToken(data.data.token)
    spinner.succeed("Logged in successfully")

  } catch {
    spinner.fail("Unable to reach server")
    process.exit(1)
  }
}