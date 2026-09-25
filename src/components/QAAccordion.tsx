"use client";

import { useState } from "react";
import type { QAItem } from "@/lib/api";

/** Renders reports produced by the previous version of the jury (question/answer lists). */
export function QAAccordion({ items }: { items: QAItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!items.length) return <p className="text-sm text-muted-foreground">No answers recorded.</p>;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border-2 border-ink bg-card overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex justify-between gap-3 px-4 py-3 text-left text-sm font-semibold"
            aria-expanded={open === i}
          >
            {item.question}
            <span aria-hidden>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="px-4 pb-4 text-sm leading-relaxed border-t-2 border-dashed border-ink/30 pt-3">{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}
