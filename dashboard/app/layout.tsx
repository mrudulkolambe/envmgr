import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EnvMgr - Secure Environment Management",
  description: "Bank-grade encrypted environment variable management for teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.className} antialiased dark`}
      >
        <Toaster theme="dark" richColors/>
        {children}
      </body>
    </html>
  );
}
