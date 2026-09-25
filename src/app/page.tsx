"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  AlertTriangle, ArrowRight, CheckCircle2, Code2, Gavel, GitBranch, LineChart, Quote, Search, ShieldCheck, Sparkles, Trophy,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { CountUp, Reveal, easeOut } from "@/components/motion";
import { ScoreDial } from "@/components/score";

const CHECKS = [
  "Reads every source file",
  "Verifies each claimed feature",
  "Cites its market sources",
  "Flags commits made before the event",
  "Detects hard-coded secrets",
  "Checks the demo is live",
  "Spots near-duplicate submissions",
  "Weights your criteria, not ours",
];

const JUDGES = [
  {
    icon: Code2,
    name: "Code Judge",
    color: "var(--sky)",
    tagline: "Reads the code, not the README.",
    points: ["Clones & indexes the whole repo", "Measures tests, CI, docs, tooling", "Reviews architecture with file-level evidence", "Scans for leaked keys"],
  },
  {
    icon: LineChart,
    name: "Market Judge",
    color: "var(--mint)",
    tagline: "Researches the market live.",
    points: ["Plans its own web searches", "Finds real competitors with links", "Sizes the market with citations", "Proposes a business model & risks"],
  },
  {
    icon: Sparkles,
    name: "Product Judge",
    color: "var(--violet)",
    tagline: "Checks you built what you pitched.",
    points: ["Verifies every claim against the code", "Tests the demo link", "Compares with other submissions", "Scores innovation, theme fit & UX"],
  },
];

const STEPS = [
  { icon: GitBranch, title: "Submit a repo", text: "Teams paste a GitHub link and a short pitch." },
  { icon: Search, title: "Evidence is gathered", text: "The repo is cloned, measured and indexed; the web is searched." },
  { icon: Gavel, title: "Three judges deliberate", text: "Each scores the criteria it owns, with rationale and proof." },
  { icon: Trophy, title: "A ranked leaderboard", text: "Weighted, reproducible scores and integrity flags — live." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip">
      <Nav />
      <main id="main">
        <Hero />
        <Ticker />
        <Panel />
        <HowItWorks />
        <Integrity />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b-2 border-ink">
      <div className="h-16 px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Evalio home">
          <Logo />
          <span className="text-lg font-bold">Evalio</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Landing">
          <a href="#judges" className="hidden sm:inline px-3 py-1.5 text-sm font-semibold hover:underline">The judges</a>
          <a href="#how" className="hidden sm:inline px-3 py-1.5 text-sm font-semibold hover:underline">How it works</a>
          <Link href="/dashboard" className="btn btn-dark btn-sm ml-2">
            Open console <ArrowRight size={14} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [0, -3]);

  return (
    <section ref={ref} className="relative px-4 sm:px-6 pt-14 sm:pt-20 pb-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <motion.span
            className="chip bg-yellow mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Gavel size={13} aria-hidden /> An AI jury for hackathons
          </motion.span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
            {["Judge every", "project like", "you read"].map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: easeOut }}
              >
                {line}
              </motion.span>
            ))}
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}
            >
              <span className="relative inline-block">
                every line.
                <motion.svg
                  viewBox="0 0 300 20"
                  className="absolute -bottom-2 left-0 w-full h-4"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    d="M3 14 Q 80 2 150 10 T 297 8"
                    fill="none"
                    stroke="var(--coral)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.9, ease: easeOut }}
                  />
                </motion.svg>
              </span>
            </motion.span>
          </h1>
          <motion.p
            className="mt-7 text-lg text-muted-foreground max-w-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Evalio clones each submission, reads the code, researches the market and checks the pitch against what was
            actually built. Three specialised judges score your criteria with evidence; a head judge ranks them.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Link href="/dashboard" className="btn btn-primary !min-h-12 !px-6 text-base">
              Start a hackathon <ArrowRight size={18} />
            </Link>
            <a href="#how" className="btn !min-h-12 !px-6 text-base">See how it judges</a>
          </motion.div>
        </div>

        <motion.div style={{ y: cardY, rotate: cardRotate }} className="relative">
          <HeroReport />
        </motion.div>
      </div>
    </section>
  );
}

function HeroReport() {
  const criteria = [
    { name: "Technical Execution", judge: "var(--sky)", score: 8.1 },
    { name: "Innovation", judge: "var(--violet)", score: 7.4 },
    { name: "Market Potential", judge: "var(--mint)", score: 6.8 },
    { name: "Theme Alignment", judge: "var(--violet)", score: 8.6 },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 3 }}
      animate={{ opacity: 1, y: 0, rotate: 1.5 }}
      transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.3 }}
      className="relative brutal-card !shadow-[var(--shadow-hard-xl)] p-6"
      aria-label="Example verdict"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="eyebrow">Example verdict</p>
          <p className="text-xl font-bold">GreenRoute</p>
        </div>
        <span className="chip bg-yellow num">Rank #1 of 42</span>
      </div>
      <div className="flex gap-6 items-center">
        <ScoreDial score={7.7} size={130} stroke={12} caption={false} />
        <ul className="flex-1 space-y-2.5 min-w-0">
          {criteria.map((c, i) => (
            <li key={c.name}>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="truncate">{c.name}</span>
                <span className="num">{c.score}</span>
              </div>
              <div className="h-2.5 rounded-full border-2 border-ink bg-muted overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: c.judge }}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.score * 10}%` }}
                  transition={{ duration: 0.9, delay: 0.8 + i * 0.12, ease: easeOut }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 grid gap-2">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }} className="flex gap-2 items-start rounded-lg border-2 border-ink bg-mint/40 p-2.5 text-sm">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" aria-hidden />
          <span><strong>Claim verified:</strong> route optimisation in <code className="num text-xs">src/solver/vrp.py</code></span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6 }} className="flex gap-2 items-start rounded-lg border-2 border-ink bg-yellow/50 p-2.5 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden />
          <span>3 of 58 commits predate the hackathon start.</span>
        </motion.div>
      </div>
      <motion.span
        className="absolute -top-5 -left-5 chip bg-coral !text-sm !px-3 !py-1 rotate-[-8deg] shadow-[var(--shadow-hard-sm)]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        3 judges · 1 verdict
      </motion.span>
    </motion.div>
  );
}

function Ticker() {
  return (
    <div className="border-y-2 border-ink bg-ink text-paper py-3 overflow-hidden" aria-label="What the jury checks">
      <div className="flex w-max animate-marquee">
        {[...CHECKS, ...CHECKS].map((c, i) => (
          <span key={i} className="flex items-center gap-3 px-6 text-sm font-semibold whitespace-nowrap">
            <span className="size-2 rounded-full bg-yellow" aria-hidden /> {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Panel() {
  return (
    <section id="judges" className="px-4 sm:px-6 py-24 max-w-7xl mx-auto scroll-mt-16">
      <Reveal className="max-w-2xl mb-12">
        <p className="eyebrow mb-2">The panel</p>
        <h2 className="text-4xl sm:text-5xl font-bold">Three judges. Each owns what it knows best.</h2>
        <p className="text-muted-foreground mt-3 text-lg">
          Your criteria are routed to the right judge — <em>Code Quality</em> to the Code Judge, <em>Market Potential</em> to
          the Market Judge, <em>Innovation</em> and <em>UX</em> to the Product Judge — and weighted the way you set them.
        </p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {JUDGES.map((j, i) => (
          <Reveal key={j.name} delay={i * 0.1}>
            <motion.article whileHover={{ y: -6, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="brutal-card overflow-hidden h-full">
              <div className="p-6 border-b-2 border-ink" style={{ background: j.color }}>
                <div className="size-12 rounded-xl border-2 border-ink bg-card flex items-center justify-center mb-4 shadow-[var(--shadow-hard-sm)]">
                  <j.icon size={22} aria-hidden />
                </div>
                <h3 className="text-2xl font-bold">{j.name}</h3>
                <p className="font-semibold mt-1">{j.tagline}</p>
              </div>
              <ul className="p-6 space-y-2.5">
                {j.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm">
                    <CheckCircle2 size={17} className="shrink-0 mt-0.5" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            </motion.article>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}>
        <div className="mt-6 brutal-card p-6 flex flex-col md:flex-row gap-6 items-start md:items-center bg-yellow">
          <div className="size-12 rounded-xl border-2 border-ink bg-card flex items-center justify-center shrink-0 shadow-[var(--shadow-hard-sm)]">
            <Gavel size={22} aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">…and a Head Judge</h3>
            <p className="mt-1">
              Combines the panel with a <strong>deterministic weighted average</strong> — no black-box final number — raises integrity
              flags and writes the verdict each team receives.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-y-2 border-ink bg-card scroll-mt-16">
      <div className="px-4 sm:px-6 py-24 max-w-7xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow mb-2">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-bold">From repo link to ranking in minutes</h2>
        </Reveal>
        <ol className="grid gap-6 md:grid-cols-4 relative">
          <motion.span
            className="hidden md:block absolute top-8 left-[12%] right-[12%] h-[3px] bg-ink origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: easeOut }}
            aria-hidden
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={0.15 * i}>
              <li className="relative text-center">
                <div className="mx-auto size-16 rounded-2xl border-2 border-ink bg-yellow flex items-center justify-center shadow-[var(--shadow-hard)] relative">
                  <s.icon size={26} aria-hidden />
                  <span className="absolute -top-3 -right-3 num size-7 rounded-full bg-ink text-paper text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold mt-5">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-[220px] mx-auto">{s.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Integrity() {
  const stats = [
    { value: 5, suffix: "", label: "evaluation stages per project" },
    { value: 10, suffix: "+", label: "integrity & rule checks" },
    { value: 100, suffix: "%", label: "of scores explained with evidence" },
  ];
  return (
    <section className="px-4 sm:px-6 py-24 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="eyebrow mb-2">Fair by design</p>
          <h2 className="text-4xl sm:text-5xl font-bold">A jury that shows its work</h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Every score links back to files, sources or measurements. Pre-built projects, leaked keys, dead demos and
            copy-paste submissions are flagged before they reach the podium. Organisers can chat with the jury about any
            project and re-run it at any time.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-8">
            {stats.map((s) => (
              <div key={s.label} className="brutal-card p-4">
                <div className="num text-3xl font-bold"><CountUp value={s.value} />{s.suffix}</div>
                <div className="text-xs font-semibold text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="brutal-card p-6 rotate-1 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} aria-hidden />
              <p className="font-bold">Integrity & rule checks</p>
            </div>
            {[
              ["var(--coral)", "OpenAI API key appears hard-coded in server/config.js:12."],
              ["var(--yellow)", "41 of 60 commits predate the hackathon start."],
              ["var(--yellow)", "2 of 5 claimed features have no supporting code."],
              ["var(--sky)", "Declared as React but the code uses Next.js, Tailwind CSS."],
            ].map(([bg, text], i) => (
              <motion.p
                key={text}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.12, ease: easeOut }}
                className="rounded-lg border-2 border-ink p-3 text-sm font-medium"
                style={{ background: `color-mix(in srgb, ${bg} 40%, var(--card))` }}
              >
                {text}
              </motion.p>
            ))}
            <div className="flex gap-2 items-start pt-2 text-sm text-muted-foreground">
              <Quote size={16} className="shrink-0" aria-hidden />
              <span>“Which claimed features are missing?” — ask the jury, get file references back.</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="px-4 sm:px-6 pb-24">
      <Reveal>
        <div className="max-w-5xl mx-auto rounded-3xl border-2 border-ink bg-ink text-paper p-10 sm:p-14 text-center relative overflow-hidden shadow-[10px_10px_0_var(--yellow)]">
          <motion.div
            className="absolute -top-16 -right-16 size-56 rounded-full border-2 border-paper/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ borderStyle: "dashed" }}
            aria-hidden
          />
          <h2 className="text-4xl sm:text-5xl font-bold relative">Your next hackathon deserves a real jury.</h2>
          <p className="mt-4 text-lg text-paper/75 relative">Set your criteria in two minutes. The judges never get tired.</p>
          <Link href="/dashboard" className="btn btn-primary !min-h-12 !px-7 text-base mt-8 relative">
            Create a hackathon <ArrowRight size={18} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-card">
      <div className="px-4 sm:px-6 py-10 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <div className="font-bold">Evalio</div>
            <div className="text-xs text-muted-foreground">The AI hackathon jury · built by Onlydevs</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground max-w-md">
          Next.js · FastAPI · PostgreSQL job queue · ChromaDB code index · live web research · any OpenAI-compatible LLM
        </p>
        <nav className="flex gap-5 text-sm font-semibold" aria-label="Footer">
          <Link href="/dashboard" className="hover:underline">Console</Link>
          <Link href="/search" className="hover:underline">Search</Link>
        </nav>
      </div>
    </footer>
  );
}
