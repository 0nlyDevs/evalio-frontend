# AGENTS.md — Evalio Frontend

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 (`@theme inline`, no config file) ·
TanStack Query 5 · `motion/react` for animation · lucide-react icons · shadcn/Radix primitives in `src/components/ui/`.

```bash
npm run dev     # localhost:3000
npm run build
npm run lint    # src/components/ui/* and hooks/use-mobile have known upstream shadcn lint errors
```

`NEXT_PUBLIC_API_URL` points at the backend (default `http://localhost:8000/api`).

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/dashboard` | Hackathon list + create (weighted criteria) |
| `/hackathon/[id]` | Podium, leaderboard, submissions, open/close submissions |
| `/project/[id]` | Full jury report, pipeline progress, chat, re-evaluate |
| `/search` | Semantic search |

## Conventions

- All API calls go through `src/lib/api.ts`; types mirror the backend responses. Scores are 0–10.
- Hooks in `src/lib/hooks/` poll only while something is evaluating (`isEvaluating`).
- Judges: `code` (sky), `market` (mint), `product` (violet) — colors from `JUDGE_COLORS` in `constants.ts`.
- Styling uses the design tokens and component classes in `globals.css` (`brutal-card`, `btn`, `chip`, `field`,
  `eyebrow`, `num`). Don't hardcode hex colors in components.
- Motion: use helpers in `components/motion.tsx`; everything respects `prefers-reduced-motion` via `MotionConfig`.
- Avoid `setState` directly inside effects (React Compiler lint rule); prefer derived state or `useSyncExternalStore`.
- All user-facing text is in English.
