import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  Brain,
  Code2,
  Trophy,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ── Ambient background ─────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-arena-indigo/10 blur-[128px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-arena-cyan/8 blur-[128px] animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-arena-purple/6 blur-[96px] animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-arena-indigo text-white font-bold text-sm">
              AA
            </div>
            <span className="text-lg font-bold tracking-tight">
              Algorithm <span className="gradient-text">Arena</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-gradient rounded-lg px-5 py-2.5 text-sm font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 stagger-children">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-arena-indigo/30 bg-arena-indigo/10 px-4 py-1.5 text-sm font-medium text-arena-cyan">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Code Analysis
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Code. Compete.{" "}
            <span className="gradient-text">Optimize.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            The AI-powered algorithm platform built for Africa&apos;s sharpest
            developers. Solve real-world infrastructure problems, get instant
            feedback from <span className="font-semibold text-foreground">Google Gemini</span>,
            and prove you&apos;re the best.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="btn-gradient inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold"
            >
              Start Solving
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-medium text-muted-foreground transition-all hover:border-arena-cyan/50 hover:text-foreground"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* ── Code preview mock ──────────────────────── */}
        <div className="relative mx-auto mt-20 max-w-4xl">
          <div className="gradient-border">
            <div className="glass-card overflow-hidden rounded-xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">
                  lagos_route_optimizer.py
                </span>
              </div>
              {/* Code content */}
              <div className="p-6 font-mono text-sm leading-relaxed">
                <div>
                  <span className="text-arena-purple">def</span>{" "}
                  <span className="text-arena-cyan">optimize_routes</span>
                  <span className="text-muted-foreground">(</span>
                  <span className="text-orange-400">depot</span>
                  <span className="text-muted-foreground">,</span>{" "}
                  <span className="text-orange-400">locations</span>
                  <span className="text-muted-foreground">,</span>{" "}
                  <span className="text-orange-400">num_vehicles</span>
                  <span className="text-muted-foreground">):</span>
                </div>
                <div className="text-muted-foreground/70 ml-8 mt-1">
                  &quot;&quot;&quot;Solve the Vehicle Routing Problem for Lagos deliveries.&quot;&quot;&quot;
                </div>
                <div className="ml-8 mt-2">
                  <span className="text-arena-purple">for</span>{" "}
                  <span className="text-foreground">vehicle</span>{" "}
                  <span className="text-arena-purple">in</span>{" "}
                  <span className="text-arena-cyan">range</span>
                  <span className="text-muted-foreground">(</span>
                  <span className="text-orange-400">num_vehicles</span>
                  <span className="text-muted-foreground">):</span>
                </div>
                <div className="ml-16 mt-1">
                  <span className="text-foreground">route</span>{" "}
                  <span className="text-muted-foreground">=</span>{" "}
                  <span className="text-arena-cyan">nearest_neighbour</span>
                  <span className="text-muted-foreground">(</span>
                  <span className="text-orange-400">depot</span>
                  <span className="text-muted-foreground">,</span>{" "}
                  <span className="text-orange-400">remaining</span>
                  <span className="text-muted-foreground">)</span>
                </div>
                <div className="ml-8 mt-3">
                  <span className="text-arena-purple">return</span>{" "}
                  <span className="text-foreground">optimized_routes</span>
                </div>
                {/* AI Feedback overlay */}
                <div className="mt-6 rounded-lg border border-arena-green/30 bg-arena-green/5 p-4">
                  <div className="flex items-center gap-2 text-arena-green text-xs font-semibold uppercase tracking-wider mb-2">
                    <Brain className="h-3.5 w-3.5" />
                    Gemini Analysis
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ✅ All tests passed in <span className="text-foreground font-medium">847ms</span>.
                    Time complexity: <span className="text-arena-cyan font-medium">O(n² · k)</span>.
                    Consider a 2-opt swap to reduce total distance by ~18%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why <span className="gradient-text">Algorithm Arena</span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            More than a coding challenge — it&apos;s your personal AI-powered
            optimization lab.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Brain,
              title: "Gemini AI Coach",
              description:
                "Get instant, contextual feedback. Failed? Get a hint, not the answer. Passed? Get Big-O analysis and architecture improvements.",
            },
            {
              icon: Shield,
              title: "Sandboxed Execution",
              description:
                "Your code runs in isolated Docker containers with strict timeouts. Safe, fast, and reproducible results every time.",
            },
            {
              icon: Code2,
              title: "Real-World Problems",
              description:
                "Tackle infrastructure challenges that matter — delivery routing in Lagos, power grid optimization, and more.",
            },
            {
              icon: Zap,
              title: "Sub-Second Feedback",
              description:
                "3-second execution limit with streaming AI analysis. No waiting around for your results.",
            },
            {
              icon: Trophy,
              title: "Leaderboards",
              description:
                "Compete with the best developers across Africa. Your execution time and code quality score are ranked.",
            },
            {
              icon: Globe,
              title: "Built for Africa",
              description:
                "Challenges inspired by real infrastructure problems across Sub-Saharan Africa. Solve what matters.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-card group rounded-xl p-6 transition-all duration-300 hover:border-arena-indigo/40 hover:bg-card/80"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-arena-indigo/10 text-arena-indigo transition-colors group-hover:bg-arena-indigo/20">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="gradient-border">
          <div className="glass-card rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to prove your <span className="gradient-text">algorithm skills</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Join the arena. Write code. Get AI-powered feedback. Climb the
              leaderboard.
            </p>
            <Link
              href="/signup"
              className="btn-gradient mt-8 inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg font-semibold"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <p className="text-sm text-muted-foreground">
            © 2026 Algorithm Arena. Built for Africa&apos;s developers.
          </p>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Powered by{" "}
            <span className="font-semibold gradient-text">Google Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
