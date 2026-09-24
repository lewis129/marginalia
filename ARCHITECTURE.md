# Marginalia — Architecture

A private, account-based notes app built on React + PocketBase.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, JSX, Tailwind CSS v4, Motion-ready CSS |
| Icons / fonts | Phosphor icons, Geist + Geist Mono (self-hosted via fontsource) |
| UI kit | `cite-ui` (local component library — toasts), `marked` + `dompurify` (markdown render) |
| Backend | PocketBase (self-hosted, single Go binary + SQLite) |
| Backend SDK | `pocketbase` JavaScript SDK (v0.28) |
| Hosting | Vercel (frontend), local network PC (PocketBase), Cloudflare Tunnel (public access) |
| Source control | GitHub (`lewis129/marginalia`) |

## Topology

```
                    ┌──────────────────────────────┐
  Visitor browser ─▶│ Vercel (frontend, static)    │
                    │  https://marginalia-....vercel.app
                    └──────────────┬───────────────┘
                                   │ https (API calls, CORS allowed)
                    ┌──────────────▼───────────────┐
                    │ Cloudflare Edge              │
                    │  https://....trycloudflare.com
                    └──────────────┬───────────────┘
                                   │ tunnel (outbound from PC)
                    ┌──────────────▼───────────────┐
                    │ cloudflared (dev PC)         │
                    └──────────────┬───────────────┘
                                   │ LAN
                    ┌──────────────▼───────────────┐
                    │ PocketBase on 192.168.0.106  │
                    │  binary + pb_data + SQLite   │
                    └──────────────────────────────┘
```

The tunnel is **outbound-only**: the dev PC connects to Cloudflare, so no router port-forwarding or public IP exposure is needed.

## Frontend structure

```
src/
├── main.jsx                  entry, fonts, CSS
├── App.jsx                   ToastProvider + AuthProvider + gate (loading → app | home | auth)
├── lib/
│   ├── pocketbase.js         PocketBase client (URL from VITE_POCKETBASE_URL)
│   ├── format.js             date / due-date / greeting / error helpers
│   └── markdown.js           markdown → sanitized HTML, plain-text stripping
├── context/
│   └── AuthContext.jsx       user state, register/login/logout, authRefresh
├── hooks/
│   ├── useNotes.js           notes state + CRUD + realtime subscription
│   └── useTheme.js           dark/light theme (system-aware + toggle)
└── components/
    ├── HomePage.jsx          landing page for visitors (hero, features, steps, CTAs)
    ├── AuthPage.jsx          sign in / create account (initialMode + back link)
    ├── NotesApp.jsx          app shell: header, search, views, tag filter, masonry grid, editor
    ├── NoteCard.jsx          note tile: pin/archive actions, tags, due badge, search highlight
    ├── NoteEditor.jsx        overlay editor: autosave, tags, pin/archive, due date, markdown preview
    └── BrandMark.jsx         inline SVG logo
```

Key patterns:

- **Single client instance.** One `PocketBase` client is created in `lib/pocketbase.js`; `autoCancellation(false)` prevents "Client canceled" errors.
- **Auth state is reactive.** `AuthContext` listens to `pb.authStore.onChange(...)`, so login/logout propagate automatically to the UI. On first load it calls `authRefresh()` to validate a stored session.
- **Auth session persistence.** The SDK's default `LocalAuthStore` persists the JWT to `localStorage` in the browser.
- **Protected surface.** `App.jsx` renders the app only when `user` exists. Visitors get a landing page (`HomePage`) with CTAs that open the auth screen pre-selected to sign-in or create-account; a "Home" link returns them.
- **Debounced autosave.** `NoteEditor` flushes changes ~700ms after the last keystroke; create/update run through `useNotes`.
- **Realtime.** `useNotes` subscribes to `notes` (`*` event) and reloads the list on remote changes — edits in one tab appear in others.
- **Toasts.** `App.jsx` wraps the app in `cite-ui`'s `ToastProvider`; actions (deleted, pinned, archived, created) and failures fire `useToast()` notifications top-right.
- **Views & tags.** `NotesApp` filters client-side by view (Active / Upcoming / Pinned / Archived), a single tag, and the search query; pinned-first ordering with due dates next.
- **Markdown.** `lib/markdown.js` renders `marked` output through `DOMPurify` (XSS-safe) for the editor's Preview mode; card snippets strip markup to plain text.
- **Search highlight.** `NoteCard` highlights query matches in the title and snippet using `HighlightText`.

## Backend: collections

### `users` (auth collection)
- Email + password auth (signup, login, JWT sessions).
- Fields: `email`, `verified`, `avatar` (unused), etc. — default auth fields.

### `notes` (base collection)
| Field | Type | Notes |
|---|---|---|
| `title` | text | optional |
| `body` | text | plain text authored in the editor; **markdown** renders in Preview mode |
| `author` | relation → users | required, single-select |
| `tags` | select (multi, custom allowed) | e.g. idea / todo / project / reference / question / random + custom |
| `pinned` | bool | pinned notes sort to the top |
| `archived` | bool | archived notes leave the default view |
| `due` | date | optional due date; drives the Upcoming view + card badge |
| `created` / `updated` | autodate | system fields |

Schema + rules are captured in `pb_migrations/1790268362_secure_notes_rules.js`; the extra fields (`tags`, `pinned`, `archived`, `due`) in `pb_migrations/1790272347_notes_extra_features.js`. Apply both on the server PC with `pocketbase serve` (auto) or `./pocketbase migrate up`.

## Access rules (the security model)

Every collection has per-action rules evaluated in PocketBase before serving a request:

| Rule | Expression |
|---|---|
| List / View | `@request.auth.id = author.id` |
| Create | `@request.auth.id != ""` |
| Update / Delete | `@request.auth.id = author.id` |

Consequences:

- Anonymous users **cannot** list, create, update, or delete notes.
- Users can only touch **their own** notes — messing with the `author` field in a request doesn't help, because rules are enforced server-side against the actual record.
- The rule-token is injected by PocketBase from the verified JWT; clients never send `author` as a trust boundary, though the app sets it explicitly for niceness.

This is the PocketBase equivalent of Supabase RLS policies — but evaluated per collection with its own syntax.

## Auth flow

```
Register   → POST /api/collections/users/records   → record created
Login      → POST /api/collections/users/auth-with-password → JWT + record
Session    → pb.authStore stores token (localStorage); onChange updates React state
Validation → authRefresh() on load; authStore.clear() on failure
Logout     → authStore.clear() (realtime subscription torn down via effect cleanup)
```

The JWT identifies the user in the `Authorization: Bearer <token>` header on every later request; rules use `@request.auth.id` derived from it.

## Data flow

**Create note:** editor debounce → `useNotes.createNote` → SDK `create({ title, body, author })` → PocketBase validates (fields + rules) → returns record → inserted at top of local list → realtime broadcast to other sessions.

**Update / Delete:** owned-rule must hold (`@request.auth.id = author.id`); otherwise PB refuses and the UI shows the error (drives "Could not save" and a silent delete-button).

**Realtime:** SSE-based subscription `pb.collection("notes").subscribe("*", ...)`; the callback refetches the list so any session's changes propagate.

## Configuration

| Variable | Used by | Default |
|---|---|---|
| `VITE_POCKETBASE_URL` | browser → PocketBase | `http://127.0.0.1:8090` |

The value differs by environment:

- **Local dev:** `http://192.168.0.106:8090` (direct LAN)
- **Deployed (Vercel):** the public HTTPS tunnel URL (`https://....trycloudflare.com`) — set in Vercel env vars at build time

`.env` is gitignored; `.env.example` documents the schema for new clones.

## Deployment

- **Push to GitHub** → Vercel auto-deploys builds `main`.
- **PocketBase** runs on a home PC as a single binary (`pocketbase serve`), data in `pb_data/`.
- **Tunnel** exposes it publicly (Cloudflare Tunnel); current setup uses a quick tunnel whose URL regenerates on restart — upgrade to a named tunnel + domain for a stable address.
- Backups = copy `pb_data/` (or use `pocketbase migrate snapshot` + the Dashboard backup tool).

## Known limits / next steps

- Quick-tunnel URL is temporary; a named tunnel (`api.yourapp.com`) gives a permanent endpoint.
- No SMTP configured yet — password reset / email verification / OTP flows are wired in the SDK but need `Settings → Mail`.
- OAuth2 (Google) not wired.
- CORS is currently open (`*`); restrict origins to the app's domain once the URL is stable.
- Markdown is render-only in the editor (Preview) — no full rich-text editing, version history, or attachments yet.