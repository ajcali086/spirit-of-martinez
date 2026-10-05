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

### Audio

The chapter readings and the music play from the `spirit-audio` Vercel
Blob store (`src/lib/chapterAudio.ts`); the repository keeps no copies. To
replace or add one, put the MP3 (and its AAC, from
`scripts/encode-chapter-aac.py`) in `public/audio/` and bump the chapter's
`?v=` in `src/data/chapters.ts`. The next production build uploads it
(`scripts/upload-audio.mjs`); previews never touch the store. Once it is
live, the file can come out of the repository again.

## Museumwright starter

`mw`, the starter (Starter Spec v2), lives in its own repository,
[ajcali086/Museumwright-](https://github.com/ajcali086/Museumwright-). It
generates a clean museum repository from the structure this one's
workbench established, and writes records, media and proposals into it
from a URL or a folder.

## Contents

Fifteen chapters, the crew, the aircraft, the mission board, the archive, and a sources page that states what kind of evidence each claim rests on.
