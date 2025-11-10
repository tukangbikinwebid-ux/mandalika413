"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Search,
  Copy as CopyIcon,
  Link as LinkIcon,
  ListTree,
  Shuffle,
} from "lucide-react";

/* ========================================
   Types
======================================== */
export type FaqItem = { q: string; a: string };

interface FaqListProps {
  items: FaqItem[];
  title?: string;
  allowMultiple?: boolean; // default: true (accordion multi-open)
  defaultOpen?: number[]; // default: []
  className?: string;
}

/* ========================================
   Utils
======================================== */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

function highlight(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="rounded px-1 py-0.5 bg-yellow-300/30 text-yellow-200"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

/* ========================================
   Component
======================================== */
export default function FaqList({
  items,
  title = "Kamu Punya Pertanyaan?",
  allowMultiple = true,
  defaultOpen = [],
  className,
}: FaqListProps) {
  // open state as a Set for flexible single/multi modes
  const [openSet, setOpenSet] = useState<Set<number>>(new Set(defaultOpen));
  const [query, setQuery] = useState("");
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Filter items (preserve original index for stable keys and actions)
  const filtered = useMemo(
    () =>
      items
        .map((it, i) => ({ it, i }))
        .filter(({ it }) =>
          !query
            ? true
            : it.q.toLowerCase().includes(query.toLowerCase()) ||
              it.a.toLowerCase().includes(query.toLowerCase())
        ),
    [items, query]
  );

  // Open item by hash if present (e.g., /faq#apa-itu-xyz)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const index = items.findIndex((it) => slugify(it.q) === hash);
    if (index >= 0) {
      setOpenSet((prev) => new Set(prev).add(index));
      // smooth scroll into view
      setTimeout(() => {
        document
          .getElementById(`faq-${index}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [items]);

  const isOpen = (i: number) => openSet.has(i);

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      const open = next.has(i);
      if (allowMultiple) {
        open ? next.delete(i) : next.add(i);
      } else {
        next.clear();
        if (!open) next.add(i);
      }
      return next;
    });
  };

  const expandAll = () => setOpenSet(new Set(filtered.map(({ i }) => i)));
  const collapseAll = () => setOpenSet(new Set());

  const copyLink = async (i: number) => {
    const id = slugify(items[i].q);
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    await navigator.clipboard.writeText(url);
  };

  // Keyboard nav (arrow up/down between questions when focused)
  const onKeyDown = (e: React.KeyboardEvent) => {
    const focusIndex = btnRefs.current.findIndex(
      (el) => el === document.activeElement
    );
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(btnRefs.current.length - 1, focusIndex + 1);
      btnRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(0, focusIndex - 1);
      btnRefs.current[prev]?.focus();
    }
  };

  return (
    <section
      className={["mx-auto max-w-7xl px-4 py-10", className ?? ""].join(" ")}
      onKeyDown={onKeyDown}
    >
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl p-[1px]">
        <div className="absolute inset-0 -z-10 animate-pulse bg-[conic-gradient(at_20%_10%,theme(colors.indigo.500/.3),theme(colors.fuchsia.500/.3),theme(colors.sky.500/.3),theme(colors.indigo.500/.3))] blur-2xl" />
        <div className="rounded-3xl bg-[#1b1b21] p-5 ring-1 ring-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                <ListTree className="h-5 w-5 text-white/80" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white/95">
                {title}
              </h3>
              <span className="ml-2 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60 ring-1 ring-white/10">
                {items.length} topik
              </span>
            </div>

            <div className="flex flex-1 items-center gap-2 md:flex-initial">
              <div className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  aria-label="Cari FAQ"
                  placeholder="Cari pertanyaan atau kata kunci..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white/90 placeholder:text-white/40 outline-none ring-0 focus:border-white/20"
                />
              </div>
              <div className="hidden gap-2 md:flex">
                <button
                  type="button"
                  onClick={expandAll}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10"
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10"
                >
                  Tutup Semua
                </button>
              </div>
            </div>
          </div>

          {query && (
            <p className="mt-3 text-xs text-white/60">
              Menampilkan{" "}
              <span className="font-semibold text-white/80">
                {filtered.length}
              </span>{" "}
              {`dari ${items.length} hasil untuk "${query}"`}.
            </p>
          )}
        </div>
      </div>

      {/* List */}
      <div className="relative rounded-3xl p-[1px]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl" />
        <div className="rounded-3xl bg-[#121216] ring-1 ring-white/10">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-white/60">
                Tidak ada hasil. Coba kata kunci lain.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {filtered.map(({ it, i }, row) => {
                const id = slugify(it.q);
                const open = isOpen(i);
                return (
                  <li key={`${id}-${i}`} id={id}>
                    <div className="group/row">
                      <button
                        ref={(el) => {
                          btnRefs.current[row] = el;
                        }}
                        aria-expanded={open}
                        aria-controls={`faq-panel-${i}`}
                        id={`faq-${i}`}
                        onClick={() => toggle(i)}
                        className="flex w-full items-start gap-3 px-5 py-5 text-left transition hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/40"
                      >
                        {/* caret */}
                        <motion.div
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                          className="mt-1 rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>

                        {/* question */}
                        <div className="flex-1">
                          <h4 className="text-base font-medium leading-6 text-white/90">
                            {highlight(it.q, query)}
                          </h4>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div
                                id={`faq-panel-${i}`}
                                key={`panel-${i}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: "tween", duration: 0.22 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 text-sm leading-relaxed text-white/70">
                                  {highlight(it.a, query)}
                                </div>

                                {/* actions */}
                                <div className="mt-4 flex items-center gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyLink(i);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/70 hover:bg-white/10"
                                    title="Salin tautan ke pertanyaan ini"
                                  >
                                    <CopyIcon className="h-3.5 w-3.5" /> Salin
                                    tautan
                                  </button>
                                  <a
                                    href={`#${id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/70 hover:bg-white/10"
                                  >
                                    <LinkIcon className="h-3.5 w-3.5" />#
                                  </a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Footer helpers (mobile visible) */}
      <div className="mt-6 flex items-center justify-between gap-2 md:hidden">
        <button
          onClick={expandAll}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80"
        >
          <Shuffle className="h-4 w-4" /> Buka semua
        </button>
        <button
          onClick={collapseAll}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80"
        >
          Tutup semua
        </button>
      </div>
    </section>
  );
}
