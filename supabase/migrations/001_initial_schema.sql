-- =====================================================
-- Algorithm Arena — Initial Database Schema
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users table (extends Supabase auth.users) ────────────────────────────

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('developer', 'company')),
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Application user profiles, linked to Supabase auth.users';

-- ── Challenges table ─────────────────────────────────────────────────────

CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    starter_code TEXT NOT NULL DEFAULT '',
    test_cases JSONB NOT NULL DEFAULT '[]',
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.challenges IS 'Coding challenges with hidden test cases for algorithm benchmarking';

-- ── Submissions table ────────────────────────────────────────────────────

CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'python',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'passed', 'failed', 'error')),
    execution_time_ms INTEGER,
    stdout TEXT,
    stderr TEXT,
    ai_feedback JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.submissions IS 'User code submissions with execution results and AI feedback';

-- ── Indexes ──────────────────────────────────────────────────────────────

CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_submissions_challenge ON public.submissions(challenge_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);

-- ── Row-Level Security ───────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Users: read/update own profile only
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Challenges: publicly readable (no auth required to browse)
CREATE POLICY "Challenges are publicly readable"
    ON public.challenges FOR SELECT
    USING (true);

-- Submissions: users see and create their own only
CREATE POLICY "Users can read own submissions"
    ON public.submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ── Auto-create user profile on signup ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Seed: sample challenge ───────────────────────────────────────────────

INSERT INTO public.challenges (title, description, starter_code, test_cases, difficulty)
VALUES (
    'Lagos Delivery Route Optimizer',
    E'## The Problem\n\nYou are a logistics company operating in Lagos, Nigeria. You have a fleet of **3 delivery vans** starting from a central depot and need to deliver packages to **6 locations** across the city.\n\n### Objective\nWrite a function `optimize_routes(depot, locations, num_vehicles)` that returns a list of routes (one per vehicle) minimizing total travel distance.\n\n### Input\n- `depot`: Tuple `(lat, lng)` — the starting/ending point for all vehicles.\n- `locations`: List of tuples `[(lat, lng), ...]` — delivery destinations.\n- `num_vehicles`: Integer — number of available vans.\n\n### Output\n- A list of lists, where each inner list contains the indices of locations assigned to that vehicle, in visit order.\n- Example: `[[0, 2], [1, 4], [3, 5]]` means Van 1 visits locations 0 then 2, Van 2 visits 1 then 4, etc.\n\n### Constraints\n- Every location must be visited exactly once.\n- Each vehicle must return to the depot (implicit — not included in output).\n- Minimize the **total Euclidean distance** across all routes.\n\n### Hints\n- A greedy nearest-neighbour heuristic is a good starting point.\n- For a better solution, consider 2-opt local search or even a simple genetic algorithm.',
    E'import math\nfrom typing import List, Tuple\n\ndef optimize_routes(\n    depot: Tuple[float, float],\n    locations: List[Tuple[float, float]],\n    num_vehicles: int\n) -> List[List[int]]:\n    \"\"\"\n    Assign delivery locations to vehicles and order them to minimize\n    total travel distance.\n    \n    Args:\n        depot: (lat, lng) of the central depot\n        locations: list of (lat, lng) for each delivery\n        num_vehicles: number of available delivery vans\n    \n    Returns:\n        List of routes — each route is a list of location indices\n    \"\"\"\n    # TODO: Implement your solution here\n    # Hint: start with a nearest-neighbour greedy approach\n    pass\n',
    '[
        {
            "name": "Basic 3-vehicle routing",
            "input": {
                "depot": [6.5244, 3.3792],
                "locations": [
                    [6.4281, 3.4219], [6.4550, 3.3841],
                    [6.5100, 3.3500], [6.4698, 3.5852],
                    [6.5950, 3.3417], [6.4400, 3.5000]
                ],
                "num_vehicles": 3
            },
            "check": "all_visited",
            "expected_vehicles": 3
        },
        {
            "name": "Single vehicle fallback",
            "input": {
                "depot": [6.5244, 3.3792],
                "locations": [
                    [6.4281, 3.4219], [6.4550, 3.3841]
                ],
                "num_vehicles": 1
            },
            "check": "all_visited",
            "expected_vehicles": 1
        },
        {
            "name": "Efficiency benchmark",
            "input": {
                "depot": [6.5244, 3.3792],
                "locations": [
                    [6.4281, 3.4219], [6.4550, 3.3841],
                    [6.5100, 3.3500], [6.4698, 3.5852],
                    [6.5950, 3.3417], [6.4400, 3.5000]
                ],
                "num_vehicles": 3
            },
            "check": "distance_under",
            "max_distance": 1.0
        }
    ]'::jsonb,
    'medium'
);
