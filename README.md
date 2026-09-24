# Marginalia

A private, account-based notes app for the thoughts that shouldn't get lost — written in the margins of your day.

Built with **React + Vite** on the frontend and a self-hosted **PocketBase** backend. Every note is private to your account, synced across tabs in real time, and tagged, pinned, and dated so you can actually find it later.

![stack](https://img.shields.io/badge/React%2019-23201a) ![stack](https://img.shields.io/badge/Vite%208-23201a) ![stack](https://img.shields.io/badge/Tailwind%20v4-23201a) ![stack](https://img.shields.io/badge/PocketBase-23201a)

## Features

- **Accounts** — email + password signup/login, JWT sessions persisted in the browser.
- **Notes** — autosaving editor, plain-text body with a **markdown preview**.
- **Pin** — keep the important notes at the top of the page.
- **Tags** — tag notes as you write, filter the whole notebook by one tap.
- **Due dates** — a date per note; an *Upcoming* view keeps you honest, cards show overdue badges.
- **Archive** — tidy up without deleting; restore any time.
- **Search with highlights** — matches light up in titles and body text.
- **Realtime** — changes propagate instantly across open tabs.
- **Private by default** — server-enforced per-user access rules; no one else can read a single page.
- **Toasts** — action feedback via the `cite-ui` component library.

## Tech

| Layer | What |
|---|---|
| Frontend | React 19, Vite 8, JSX, Tailwind CSS v4 |
| UI kit | `cite-ui` (local library — toasts), Phosphor icons, Geist fonts |
| Markdown | `marked` + `dompurify` (XSS-safe) |
| Backend | PocketBase (single Go binary + SQLite), `pocketbase` JS SDK |
| Hosting | Vercel (frontend) · PocketBase on a LAN PC · Cloudflare Tunnel for public access |

## Getting started

### Prerequisites

- Node.js 18+
- A PocketBase instance running (local or reachable over the network)

### Install

```bash
git clone https://github.com/lewis129/marginalia.git
cd marginalia
npm install
```

### Configure the backend URL

Create `.env` (see `.env.example`):

```bash
VITE_POCKETBASE_URL=http://192.168.0.106:8090
```

> This value is baked into the bundle at build time. Local dev points at your LAN PocketBase; production points at a public HTTPS tunnel URL.

### Run

```bash
npm run dev       # dev server
npm run build     # production build → dist/
npm run preview   # preview the build
```

## Applying the database migrations

The collections and rules are versioned under `pb_migrations/`. Copy them to your PocketBase server's `pb_migrations/` folder and restart `pocketbase serve` (unapplied migrations run automatically, or use `./pocketbase migrate up`):

- `1790268362_secure_notes_rules.js` — per-user access rules + required `author` field
- `1790272347_notes_extra_features.js` — `tags`, `pinned`, `archived`, `due` fields

## Project structure

```
src/
├── main.jsx            entry, fonts, CSS
├── App.jsx             providers + gate (landing → auth → app)
├── lib/                pocketbase client, format/due-date helpers, markdown
├── context/            auth context
├── hooks/              notes CRUD + realtime, theme
└── components/         HomePage, AuthPage, NotesApp, NoteCard, NoteEditor, BrandMark
```

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — topology, collections, access rules, auth + data flow, deployment.
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — the failure modes that actually bite: baked-in URLs, LAN-only backends, CORS, silent rule failures, tunnel death.