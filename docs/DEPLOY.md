# Deploy

Pushing or merging to GitHub does **not** deploy. The live site changes only when the app is
rebuilt on the droplet. Only Nina decides when that happens.

Host, user and paths are in Nina's private notes (not in this public repo).

## Recipe (worked on 2026-10-03)
1. `make check` green on `main`; the change is merged.
2. SSH to the droplet; `cd` to the app checkout (the repo there is owned by root: run git as root).
3. `git pull --ff-only`
4. `docker compose build` (needs ~720 MB RAM; the droplet has ~650 MB free and no swap,
   it has worked, but stop other heavy containers if it fails).
5. `docker compose up -d`
6. Check live: the home page loads, the price menu and studio info show, and
   `GET /api/bookings` without login returns 401.

## Database
No migration step exists. New content tables are created and seeded by the server on
start-up (`DatabaseStorage.ensureContent`). **Never run `npm run db:push`**: it is
`drizzle-kit push --force` and can drop tables with live bookings.

## Caddy (reverse proxy) — known trap, not fixed yet
The Caddy container bind-mounts a single Caddyfile. The host file was later replaced by a
new file, so the container still serves an older copy. Reloading from the host file and
from the container's copy give different sites. Edit the file **in place** (same inode) or
recreate the container, and check every site it serves afterwards.

Pending improvement (Lighthouse mobile ~72 → ~90): compression and long caching for
hashed assets in the site's Caddy block:
```
encode zstd gzip
@assets path /assets/*
header @assets Cache-Control "public, max-age=31536000, immutable"
```
