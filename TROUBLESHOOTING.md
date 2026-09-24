# Troubleshooting

Quick reference for the problems most likely to hit this project. Diagnose bottom-up: server reachable → URL correct → rules correct → tunnel alive.

---

## Symptom: "Something went wrong" on login / register (deployed site)

The deployed app cannot reach PocketBase.

**Check the deployed build actually contains the right URL** (env vars are compiled into the bundle at build time, so `.env` alone does nothing on Vercel):

```powershell
# 1. get the bundle filename
curl.exe -s https://<your-app>.vercel.app/ | Select-String 'assets/index'

# 2. search it for the baked-in PocketBase URL
curl.exe -s https://<your-app>.vercel.app/assets/index-XXXX.js | Select-String '8090|trycloudflare'
```

If you see `http://127.0.0.1:8090`, `VITE_POCKETBASE_URL` was never provided at build time.

**Fix:** set `VITE_POCKETBASE_URL` in Vercel → Settings → Environment Variables (Production) and redeploy, then re-inspect the bundle.

---

## Symptom: deployed site still fails after setting the env var

Three almost-certain causes, in order of likelihood:

1. **The backend is on a private LAN address.** `http://192.168.x.x` is only reachable inside your network. Vercel (and visitors) cannot route to it. You need the tunnel (see below) or a cloud-hosted PocketBase.
2. **Mixed content.** An `https://` page blocks `http://` API calls. The PocketBase URL must be `https://`.
3. **The tunnel is down.** Quick-tunnel URLs die when the `cloudflared` process stops or the PC reboots, and a restart generates a *new* URL — which then no longer matches the env var.

**Diagnose from your PC:**

```powershell
# PocketBase alive?
curl.exe http://192.168.0.106:8090/api/health
# Tunnel alive? (substitute your tunnel URL)
curl.exe https://random-words.trycloudflare.com/api/health
```

Both should return `200`.

---

## Symptom: "Could not save" / delete button does nothing (local dev)

Almost always **missing access rules** on a collection. With empty rules:

- `list`/`create` → open to everyone
- `update`/`delete` → **superusers only** → normal users get silently refused

So the note never updates and delete never happens. Fix in the Dashboard (`notes` collection → Rules) or via migration:

| Rule | Value |
|---|---|
| List | `@request.auth.id = author.id` |
| View | `@request.auth.id = author.id` |
| Update | `@request.auth.id = author.id` |
| Delete | `@request.auth.id = author.id` |
| Create | `@request.auth.id != ""` |

See `pb_migrations/1790268362_secure_notes_rules.js` for the migration that applies this.

---

## Symptom: saving fails with "Could not save" *only right after adding tags / pinning / archiving*

The frontend now writes four more fields (`tags`, `pinned`, `archived`, `due`) that the running PocketBase **doesn't have yet**. Saving a record with unknown fields errors.

**Fix:** apply the schema migration on the server PC. Copy `pb_migrations/1790272347_notes_extra_features.js` into the server's `pb_migrations/` folder, then either:

```powershell
pocketbase serve    # applies unapplied migrations automatically on start
# or, if serve is already running:
pocketbase migrate up
```

Alternative (no file needed): add the fields manually in the PB Dashboard under **Collections → notes → Edit** (multi-select "tags", booleans "pinned"/"archived", date "due"). With `--automigrate` on, the Dashboard writes the migration file for you.

Verify from the browser: open a note, toggle Pin, and the toast "Pinned to the top" should appear.

---

## Symptom: anonymous visitors can read/write your notes

Confirms rules are missing. Test anonymously:

```powershell
curl.exe "http://192.168.0.106:8090/api/collections/notes/records?perPage=1"
```

You should get an empty result (or an auth error), never real records. If records leak, apply the rules above.

---

## Symptom: every API call works in curl but fails in the browser

Classic CORS. Check the preflight exactly as a browser would send it:

```powershell
curl.exe -i -X OPTIONS http://192.168.0.106:8090/api/collections/notes/records `
  -H "Origin: http://localhost:5173" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: authorization,content-type"
```

Look for `Access-Control-Allow-Origin: *` (or your origin) and `Access-Control-Allow-Headers` containing `authorization`. PocketBase allows all origins by default; if you restricted origins, your frontend origin must be listed.

---

## Symptom: realtime updates stop after some time

The realtime subscription auto-reconnects, but only while the page has a browser connection. Also make sure the subscribe call from `useNotes` was **awaited properly** — `pb.collection("notes").subscribe("*", cb)` returns a `Promise` that resolves to the unsubscribe function. Calling the promise itself as a function throws.

---

## Keeping the tunnel alive

- The tunnel runs as a background process on the dev PC. It must stay on and online.
- Restarting it produces a new URL → update Vercel env var → redeploy.
- For a stable, permanent URL use a named tunnel with your own domain:

```powershell
cloudflared tunnel login
cloudflared tunnel create marginalia
cloudflared tunnel route dns marginalia api.yourdomain.com
cloudflared service install   # runs automatically at boot
```

---

## The mental model

1. **Backend URL** — is it the URL you intended? (inspect the deployed bundle)
2. **Reachability** — can the deployed host physically reach it? (never a `192.168.x.x` from Vercel)
3. **HTTPS** — browsers refuse `http://` from an `https://` page.
4. **Rules** — "fails silently" on update/delete = empty rule = superuser-only.
5. **Tunnel alive?** — quick tunnels break on reboot/restart.