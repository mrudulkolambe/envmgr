# Envmgr SDK & React Context

> **Note**: This SDK is part of the unified `envmgr` npm package that also includes the CLI.

The Envmgr SDK allows you to easily integrate feature flags into your React and Next.js applications, as well as standalone Node.js server-side logic.

## 📦 Installation

```bash
npm install envmgr
```

## ⚛️ React & Next.js Usage

### 1. Wrap your app with the Provider

```tsx
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

### 2. Check for Feature Flags in Hooks

```tsx
import { useFeatureFlag } from 'envmgr/react';

export function MyComponent() {
  const isEnabled = useFeatureFlag('experimental-feature');

  return (
    <div>
      {isEnabled ? <NewFeatures /> : <StableUI />}
    </div>
  );
}
```

## 🌐 Server-Side Usage (Node.js / Next.js Server Components)

For server-side usage, use the core SDK directly to query flags without React context.

```tsx
import { EnvmgrClient } from 'envmgr/sdk';

export default async function Page() {
  const client = new EnvmgrClient("envmgr_pk_...", "https://envmgr.vercel.app");
  
  // Direct check against the database
  const isEnabled = await client.isFeatureEnabled('server-only-flag');

  return (
    <div>
      {isEnabled ? <FeatureOn /> : <FeatureOff />}
    </div>
  );
}
```

---

## 🛠️ Unified Package Architecture

The `envmgr` package provides three main sub-paths for different use cases:

- **`envmgr`**: The **CLI** entry point. (Used by global install).
- **`envmgr/react`**: High-level **React Context** and **Hooks**.
- **`envmgr/sdk`**: Low-level **EnvmgrClient** for programmatic usage.

## 🌟 Key Features

- **Direct Fetching**: The SDK fetches statuses directly from the database for ultimate freshness.
- **Asynchronous Checks**: Individual checks are optimized via a dedicated API endpoint.
- **Type-safe**: Fully built with TypeScript.
- **Zero-Dependency Core**: Lightweight and fast.
