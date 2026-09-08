# The Spirit of Martinez

Companion site for the family memoir *The Spirit of Martinez / What a Family Kept* — Frank Calicura, 95th Bomb Group, B-17G 44-6838, Horham, 1945.

Built by Andrew Calicura from the objects the family kept.

## Stack

- TanStack Start (React 19 + Vite + Nitro)
- Tailwind CSS
- No auth, no database — the book and the archive are the data
- Node 22

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

```bash
npm run typecheck
npm run build
```

## CI / CD

GitHub Actions:

| Workflow | When | What |
|---|---|---|
| [CI](.github/workflows/ci.yml) | every push and pull request | `npm ci`, typecheck, production build |
| [Deploy](.github/workflows/deploy.yml) | every push and pull request, if Vercel secrets are set | preview deploy on PRs, production deploy on `main` |

### Option A — Vercel Git integration (simplest)

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Framework: leave auto / Vite. Build command is `npm run build` (already in `vercel.json`).
4. Every push to `main` ships production; every PR gets a preview URL.

### Option B — GitHub Actions → Vercel

Create a Vercel token and add these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID` (Project Settings → General)
- `VERCEL_PROJECT_ID`

Then the Deploy workflow runs on its own. CI still runs even if those secrets are missing.

## Contents

Fifteen chapters, the crew, the aircraft, the mission board, the archive, and a sources page that states what kind of evidence each claim rests on.
