import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { QueryProvider } from "@/components/providers";
import { ToastNotification } from "@/components/ToastNotification";
import { GlobalProgressBar } from "@/components/GlobalProgressBar";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Evalio — the AI hackathon jury",
  description:
    "Three AI judges read the code, research the market and test the product of every hackathon submission, then rank them with evidence.",
  icons: { icon: "/evalio.svg", shortcut: "/evalio.svg", apple: "/evalio.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] btn btn-primary"
        >
          Skip to content
        </a>
        <QueryProvider>
          <GlobalProgressBar />
          {children}
          <ToastNotification />
        </QueryProvider>
      </body>
    </html>
  );
}
