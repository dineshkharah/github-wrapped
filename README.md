# 🎁 GitHub Wrapped

Your year in code, as a shareable story. Enter any GitHub username and get a Spotify-Wrapped-style recap of their year — top languages, longest streak, busiest day, stars earned — capped with a generated **developer persona** and a shareable image card.

**Live demo:** https://github-wrapped-ebon.vercel.app

> No AI API, no cost, no login. The persona and captions come from a deterministic **procedural engine**, not an LLM — so the same username always produces the same Wrapped.

<!-- Tip: a screenshot or short screen-recording here makes a huge difference. -->
<!-- ![GitHub Wrapped](public/screenshot.png) -->

## ✨ Features

- **Animated story** — swipeable slides: totals, top languages, longest streak, power day, stars, and a persona reveal
- **Developer persona** — a playful archetype (The Polyglot, The Machine, The Serial Starter…) derived from your stats
- **Shareable card** — links unfurl into a generated Open Graph image on X / LinkedIn / Slack
- **Deterministic** — seeded by the username, so a profile always wraps the same way
- **Public data only** — a single read-only GitHub token, no sign-in

## 🧠 How it works

Three server-side stages:

1. **Fetch** — one GitHub GraphQL query pulls the contribution calendar + repositories (`lib/github.ts`)
2. **Compute** — pure functions derive the numbers: longest streak, busiest day, language ranking, stars (`lib/stats.ts`)
3. **Narrate** — a procedural engine scores traits to pick the dominant persona and fills bucketed caption templates, seeded by the username (`lib/persona.ts`)

The numbers are always computed deterministically; the engine only writes the *voice*. Nothing can hallucinate a fake streak.

## 🛠 Tech stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **Tailwind CSS**
- **GitHub GraphQL API** (read-only token)
- **next/og** for the share-image card
- **Supabase** for lightweight, optional usage analytics
- Deployed on **Vercel**

## 🚀 Run locally

```bash
git clone https://github.com/dineshkharah/github-wrapped.git
cd github-wrapped
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | What it's for |
| --- | --- | --- |
| `GITHUB_TOKEN` | ✅ | Read-only GitHub token (no scopes needed) for the GraphQL API |
| `SUPABASE_URL` | optional | Supabase project URL (usage analytics) |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Supabase secret key — server-side only |
| `NEXT_PUBLIC_BASE_URL` | optional | Your deployed URL, so OG image links resolve absolutely |

Analytics is optional: leave the Supabase vars blank and the app runs fine without it.

## 🗺 Roadmap

- Roast mode — a playful critique of your coding year
- Compare two developers side by side
- Tap-anywhere slide navigation
- Private contributions via GitHub OAuth

## 📄 License

MIT
