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
| [CI](.github/workflows/ci.yml) | every push and pull request | `npm ci`, typecheck, the museum model's checks (`npm run check:model`), production build |
| [Freeze new IDs](.github/workflows/freeze.yml) | every push to `main` that touches the model, chapters, captions or corrections | freezes new IDs and fingerprints new text, in a pull request for the curator |

### Deploys

Vercel's Git integration deploys: every push to `main` ships production;
every pull request gets a preview URL.

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework: leave auto / Vite. Build command is `npm run build` (already in `vercel.json`).

## Contents

Fifteen chapters, the crew, the aircraft, the mission board, the archive, and a sources page that states what kind of evidence each claim rests on.
