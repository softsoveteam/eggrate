"use client";

import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

export function FaqAccordion({
  items,
  defaultOpenIndex = 0,
  allowMultiple = false,
  className = "",
}: {
  items: FaqItem[];
  defaultOpenIndex?: number;
  allowMultiple?: boolean;
  className?: string;
}) {
  const [openSet, setOpenSet] = useState<Set<number>>(
    new Set(defaultOpenIndex >= 0 && defaultOpenIndex < items.length ? [defaultOpenIndex] : [])
  );

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!allowMultiple) next.clear();
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openSet.has(index);
        const id = `faq-${index}`;
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 dark:bg-zinc-900 ${
              isOpen
                ? "border-indigo-200 shadow-md dark:border-indigo-900/50"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left font-semibold outline-none ring-indigo-500/50 focus-visible:ring-2 sm:px-5"
              aria-expanded={isOpen}
              aria-controls={id}
              id={`faq-q-${index}`}
            >
              <span className={`text-sm sm:text-base ${isOpen ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-800 dark:text-zinc-100"}`}>
                {item.question}
              </span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                  isOpen
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
                aria-hidden
              >
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div
              id={id}
              role="region"
              aria-labelledby={`faq-q-${index}`}
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800 sm:px-5">
                  <div className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
