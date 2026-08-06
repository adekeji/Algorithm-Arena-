# Algorithm Arena

> AI-powered algorithm execution and benchmarking platform for Sub-Saharan Africa.

## Architecture

```
frontend/   → Next.js 15 (App Router, TypeScript, Tailwind v4, Shadcn UI)
backend/    → Python FastAPI
supabase/   → Database migrations (PostgreSQL)
```

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.12+
- A Supabase project ([supabase.com](https://supabase.com))

### 1. Database Setup
1. Create a Supabase project.
2. Go to **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`.

### 2. Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key
npm install
npm run dev
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# Fill in your Supabase URL, service role key, and API keys
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

### Frontend (`.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000`) |

### Backend (`.env`)
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `FRONTEND_URL` | Frontend origin for CORS |

## License
MIT
