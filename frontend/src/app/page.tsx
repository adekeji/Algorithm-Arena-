"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { algorithms } from "@/data/algorithms";
import { CatalogView } from "@/components/CatalogView";
import { CompareView } from "@/components/CompareView";
import { BenchmarkView } from "@/components/BenchmarkView";
import { AgentAssistView } from "@/components/AgentAssistView";

type Tab = "catalog" | "compare" | "benchmark" | "agent";

const TABS: { id: Tab; label: string }[] = [
  { id: "catalog", label: "Catalog" },
  { id: "compare", label: "Compare" },
  { id: "benchmark", label: "Live Benchmark" },
  { id: "agent", label: "Foundry IQ Agent" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("catalog");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedAlgos = useMemo(
    () => algorithms.filter((a) => selected.has(a.id)),
    [selected]
  );

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#05060a]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-[var(--accent)]/40 to-[var(--accent-2)]/30 text-lg font-bold text-white">
              Σ
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-gradient">Algorithm Arena</span>
              </h1>
              <p className="text-xs text-white/40 hidden md:block">
                Compare complexity, memory, CPU, architecture, gaming &amp; simulation fit — then
                benchmark live.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <nav className="glass flex gap-1 self-start rounded-xl p-1 overflow-x-auto max-w-full">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    tab === t.id
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {t.label}
                  {t.id === "compare" && selected.size > 0 && (
                    <span className="ml-2 rounded-full bg-[var(--accent)]/40 px-1.5 py-0.5 text-[10px]">
                      {selected.size}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <Link
              href="/login"
              className="rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent)]/40 self-start md:self-auto whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {tab === "catalog" && (
          <CatalogView algorithms={algorithms} selected={selected} onToggle={toggle} />
        )}
        {tab === "compare" && (
          <CompareView
            algorithms={algorithms}
            selected={selectedAlgos}
            onClear={() => setSelected(new Set())}
          />
        )}
        {tab === "benchmark" && <BenchmarkView algorithms={algorithms} />}
        {tab === "agent" && (
          <Suspense
            fallback={
              <div className="glass rounded-xl p-6 text-sm text-white/55">
                Loading Agent...
              </div>
            }
          >
            <AgentAssistView />
          </Suspense>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-5 pb-10 pt-4 text-center text-xs text-white/30">
        {algorithms.length} algorithms across{" "}
        {new Set(algorithms.map((a) => a.category)).size} categories · Benchmarks run locally in
        your browser — results vary with your CPU, browser engine and load.
      </footer>
    </div>
  );
}
