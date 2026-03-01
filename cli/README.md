# 🛠️ EnvMgr: Unified Environment & Feature Flag Management

**EnvMgr** is a powerful, unified toolset for managing environment variables and feature flags across your projects. It provides a **CLI** for developers and an **SDK** for your applications—all bundled in a single package.

---

## 📦 Installation

Since EnvMgr provides both a CLI and an SDK, you only need to install one package:

### For Global CLI Usage

```bash
sudo npm install -g envmgr
```

### For Project SDK Usage

```bash
npm install envmgr
```

---

## 💻 1. CLI Usage (Developer Workflow)

The CLI is your primary tool for managing variables and linking your local codebase to the EnvMgr cloud.

### **Interactive Dashboard**

Simply run `envmgr` to open the beautiful interactive console. From here, you can manage almost everything.

```bash
envmgr
```

### **Common Commands**

- **`envmgr configure`**: Set your API server URL.
- **`envmgr login`**: Authenticate with your credentials.
- **`envmgr link`**: Connect the current directory to an EnvMgr project.
- **`envmgr sync`**: Pull remote variables into your local `.env` file.
- **`envmgr push`**: Push local `.env` changes back to the cloud.

---

## 🧬 2. SDK & Context Usage (Frontend Integration)

The SDK allows you to consume feature flags directly in your React, Next.js, or Node.js applications.

### **React / Next.js Integration**

The React SDK is reachable via the `envmgr/react` sub-path.

#### **1. Wrap your application with the Provider**

```tsx
// app/layout.tsx
import { EnvmgrProvider } from 'envmgr/react';

export default function RootLayout({ children }) {
  return (
    <EnvmgrProvider 
      apiKey="envmgr_pk_..." 
      apiUrl="https://envmgr.vercel.app"
    >
      {children}
    </EnvmgrProvider>
  );
}
```

#### **2. Use Feature Flags in Components**

```tsx
import { useFeatureFlag } from 'envmgr/react';

export function MyComponent() {
  const isEnabled = useFeatureFlag('new-feature');

  return (
    <div>
      {isEnabled ? <NewUI /> : <OldUI />}
    </div>
  );
}
```

### **Node.js / Server-Side Usage**

For server-side logic, use the core client via the `envmgr/sdk` sub-path.

```tsx
import { EnvmgrClient } from 'envmgr/sdk';

const client = new EnvmgrClient("envmgr_pk_...", "https://envmgr.vercel.app");

// Check a flag directly from the database
const isEnabled = await client.isFeatureEnabled('experimental-ui');
```

---

## 🏗️ Architecture Overview

The `envmgr` package is organized into logical entry points to keep your bundles lean:

1. **`envmgr`**: The CLI entry point (bin).
2. **`envmgr/react`**: React-specific components like `EnvmgrProvider` and `useFeatureFlag`.
3. **`envmgr/sdk`**: The core `EnvmgrClient` for direct API/Database interactions.

### **Why unified?**

- **Single Dependency**: Manage one version of your environment tooling.
- **Context Awareness**: The CLI can help you generate the configuration needed for the SDK.
- **Consistency**: Use the same logic for variable management and feature flagging.

---

## 💡 Quick Tips

- Running **`envmgr sync --dry-run`** lets you see remote changes before applying them.
- Use **`Esc`** in the CLI dashboard to quickly return to previous screens.
- Feature flags are fetched **directly from the database** by the SDK to ensure zero-latency staleness.

---

*Need more details? Run `envmgr --help` or check out [SDK.md](./SDK.md) for deeper SDK documentation.*
