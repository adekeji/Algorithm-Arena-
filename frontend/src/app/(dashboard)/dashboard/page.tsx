import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// This page requires auth cookies — cannot be statically generated
export const dynamic = "force-dynamic";
import {
  Code2,
  Trophy,
  Zap,
  LogOut,
  ChevronRight,
  Clock,
  Signal,
} from "lucide-react";

export const metadata = {
  title: "Dashboard — Algorithm Arena",
  description: "Your Algorithm Arena dashboard. Browse challenges and track submissions.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Placeholder challenge data (will come from API in Phase 2+)
  const challenges = [
    {
      id: "1",
      title: "Lagos Delivery Route Optimizer",
      difficulty: "medium",
      description:
        "Optimize delivery routes across Lagos using a Vehicle Routing Problem approach.",
      submissions: 0,
    },
  ];

  const difficultyColors: Record<string, string> = {
    easy: "text-arena-green border-arena-green/30 bg-arena-green/10",
    medium: "text-arena-cyan border-arena-cyan/30 bg-arena-cyan/10",
    hard: "text-arena-purple border-arena-purple/30 bg-arena-purple/10",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Ambient background ────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-arena-indigo/6 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-arena-cyan/5 blur-[80px]" />
      </div>

      {/* ── Top nav ───────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-arena-indigo text-white font-bold text-sm">
              AA
            </div>
            <span className="text-lg font-bold tracking-tight">
              Algorithm <span className="gradient-text">Arena</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to the <span className="gradient-text">Arena</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose a challenge below and start coding. Your AI coach is standing by.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Code2, label: "Challenges", value: "1", color: "text-arena-indigo" },
            { icon: Trophy, label: "Solved", value: "0", color: "text-arena-cyan" },
            { icon: Zap, label: "AI Sessions", value: "0", color: "text-arena-purple" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card flex items-center gap-4 rounded-xl p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Challenges */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Challenges</h2>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/dashboard/challenge/${challenge.id}`}
                className="glass-card group flex items-center justify-between rounded-xl p-6 transition-all duration-300 hover:border-arena-indigo/40 hover:bg-card/80"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-arena-cyan transition-colors">
                      {challenge.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        difficultyColors[challenge.difficulty]
                      }`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />3s time limit
                    </span>
                    <span className="flex items-center gap-1">
                      <Signal className="h-3.5 w-3.5" />
                      {challenge.submissions} submissions
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-arena-cyan transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
