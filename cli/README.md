# 🚀 EnvMgr CLI Documentation

EnvMgr is a CLI tool designed to manage your environment variables across different projects and environments with ease. It provides both a beautiful interactive dashboard and powerful standalone commands.

---

## 🏗️ Getting Started

### 1. Configuration
Set your API server URL (default: `https://envmgr.vercel.app`).
```bash
envmgr configure
```

### 2. Login
Authenticate your CLI session.
```bash
envmgr login
```

### 3. Link Project
Connect your current directory to a remote EnvMgr project. This creates a `.envmgr/config.json` file to track your linkage.
```bash
envmgr link
```

---

## ⚡ Core Workflow Commands

### 🔄 Syncing Variables (Remote → Local)
Pull the latest variables from the remote server into your local environment file (e.g., `.env.local`).
```bash
envmgr sync
```
*Use `--dry-run` to see what would change without modifying files:* `envmgr sync --dry-run`

### 📤 Pushing Variables (Local → Remote)
Push your local variables back to the remote server. The CLI will ask for confirmation before updating.
```bash
envmgr push
```

### 🔀 Switch Environment
Quickly switch between different environments (e.g., staging, production) within your linked project.
```bash
envmgr switch [alias|name]
```

---

## 🛠️ Management Commands

### 📁 Add Variables (External Editor)
Bulk add variables by opening your default system editor (Vim, Notepad, etc.). 
```bash
envmgr var add
```

### ➕ Create Environment
Interactively create a new environment for a project.
```bash
envmgr env create
```

### 📋 System Status
View your current login status, API URL, and project linkage details.
```bash
envmgr status
```

### 🩺 Doctor
Run a self-diagnostic check to troubleshoot connectivity or configuration issues.
```bash
envmgr doctor
```

---

## 💡 Pro Tips

- **Interactive Mode**: Simply run `envmgr` without any arguments to open the management dashboard.
- **JSON Output**: Use `--json` with the `status` command for machine-readable output.
- **Escape Key**: Use the `Esc` key on any interactive screen to cancel and go back.
- **Security**: The `.envmgr/` folder and `.env*` files are automatically ignored in your provided `.gitignore` to keep secrets safe.

---

*Need more help? Run `envmgr --help` any time.*
