import type { JudgeKey } from "./api";

// API base URL — points to the Evalio backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// How often views refresh while the jury is still evaluating
export const POLLING_INTERVAL_MS = 4000;

// Accent colors cycled per card
export const ACCENT_COLORS = [
  "var(--yellow)",
  "var(--sky)",
  "var(--mint)",
  "var(--coral)",
  "var(--violet)",
  "var(--pink)",
] as const;

export const JUDGE_COLORS: Record<JudgeKey, string> = {
  code: "var(--sky)",
  market: "var(--mint)",
  product: "var(--violet)",
};

export const PROJECT_TYPES = [
  { value: "OTHER", label: "Other / not sure" },
  { value: "VANILLA_JS", label: "Vanilla JS" },
  { value: "REACT", label: "React" },
  { value: "NEXT_JS", label: "Next.js" },
  { value: "VUE", label: "Vue" },
  { value: "NUXT", label: "Nuxt" },
  { value: "ANGULAR", label: "Angular" },
  { value: "SVELTE", label: "Svelte" },
  { value: "SVELTEKIT", label: "SvelteKit" },
  { value: "ASTRO", label: "Astro" },
  { value: "REMIX", label: "Remix" },
  { value: "TAILWIND", label: "Tailwind" },
  { value: "NODE_EXPRESS", label: "Node / Express" },
  { value: "FASTAPI", label: "FastAPI" },
  { value: "DJANGO", label: "Django" },
  { value: "SPRING_BOOT", label: "Spring Boot" },
  { value: "GIN", label: "Gin" },
  { value: "RAILS", label: "Rails" },
  { value: "LARAVEL", label: "Laravel" },
  { value: "ACTIX", label: "Actix" },
  { value: "SWIFT_UI", label: "SwiftUI" },
  { value: "KOTLIN_JETPACK", label: "Kotlin Jetpack" },
  { value: "REACT_NATIVE", label: "React Native" },
  { value: "EXPO", label: "Expo" },
  { value: "FLUTTER", label: "Flutter" },
  { value: "DOTNET_MAUI", label: ".NET MAUI" },
  { value: "IONIC", label: "Ionic" },
  { value: "NATIVESCRIPT", label: "NativeScript" },
] as const;
