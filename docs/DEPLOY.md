# Deploy

Pushing or merging to GitHub does **not** deploy. The live site changes only when a new image
runs on the droplet. Only Nina decides when that happens.

Host, user and paths are in Nina's private notes (not in this public repo).

In the commands below, `<droplet>` is the SSH target and `<app-dir>` the app checkout on it
(both in Nina's notes). The image name `mr-studio-mr-studio` is what Docker Compose derives
from that folder and service; check it with `docker inspect mr-studio --format '{{.Config.Image}}'`.

## Before any deploy
1. Everything is merged into `main` through PRs, and CI (`check` and `audit`) is green.
2. Note the commit that is live now (`git -C <app-dir> rev-parse --short HEAD` on the droplet):
   it names the rollback tag.

## Recipe A — build on your machine, ship the image (preferred; used 2026-11-26)
The droplet has ~600 MB free and no swap. A `docker compose build` there peaks around
720 MB and can wake the out-of-memory killer, which may also take down the other containers
on the droplet (Caddy included). So build elsewhere and only *run* on the droplet.

```bash
# 1. Clean copy of main, so no local node_modules or .env end up in the image
git fetch origin && SHA=$(git rev-parse --short origin/main)
mkdir -p /tmp/mr-build && git archive origin/main | tar -x -C /tmp/mr-build

# 2. Optional but cheap: build and smoke-test natively first
docker build -t mr-studio-verify /tmp/mr-build
docker run --rm -d --name mr-verify -e SESSION_SECRET=local-check -p 5099:5002 mr-studio-verify
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5099/          # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5099/api/bookings  # 401
docker rm -f mr-verify

# 3. Build for the droplet's CPU (amd64; emulated on Apple silicon, a few minutes)
docker build --platform linux/amd64 -t mr-studio-mr-studio:latest -t mr-studio-mr-studio:$SHA /tmp/mr-build

# 4. Keep the live image as the rollback (use the commit noted above)
ssh <droplet> 'docker tag mr-studio-mr-studio:latest mr-studio-mr-studio:rollback-<live-commit>'

# 5. Ship the image (~2 minutes), and bring the checkout in line with main
docker save mr-studio-mr-studio:latest mr-studio-mr-studio:$SHA | gzip -1 | ssh <droplet> 'gunzip | docker load'
ssh <droplet> 'cd <app-dir> && git fetch -q origin && git merge --ff-only origin/main'   # as root

# 6. Switch: recreates only the mr-studio container (a few seconds of downtime)
ssh <droplet> 'cd <app-dir> && docker compose up -d --no-build && docker logs --since 1m mr-studio'
```

The logs should show the SMTP and Cloudinary lines and `serving on port 5002`, with no errors.

## Recipe B — build on the droplet (only with enough free memory)
Use only if `free -m` shows well over 800 MB available (or swap exists):
`cd <app-dir> && git pull --ff-only && docker compose build && docker compose up -d`.
The repo there is owned by root: run git as root.

## Check the live site (after either recipe)
- Home page 200; the new design shows on a phone and on desktop; no console errors.
- `/assets/*.js` comes back with `content-encoding: br` (or gzip) and
  `cache-control: public, max-age=31536000, immutable`; the HTML has `no-cache`.
- `GET /api/price-menu` and `/api/studio-info` return the owner's data;
  `GET /api/bookings` without login returns 401.
- One test booking and one admin edit when the change touched those flows.

## Rollback
```bash
ssh <droplet> 'docker tag mr-studio-mr-studio:rollback-<live-commit> mr-studio-mr-studio:latest \
  && cd <app-dir> && docker compose up -d --no-build'
```
Then reset the checkout to that commit if the next deploy should start from it. Old images
take disk space (~800 MB each): prune old rollback tags once a release has held up.

## Database
No migration step exists. New content tables are created and seeded by the server on
start-up (`DatabaseStorage.ensureContent`). **Never run `npm run db:push`**: it is
`drizzle-kit push --force` and can drop tables with live bookings.

## Caddy (reverse proxy) — known trap, not fixed yet
The Caddy container bind-mounts a single Caddyfile. The host file was later replaced by a
new file, so the container still serves an older copy. Reloading from the host file and
from the container's copy give different sites. Edit the file **in place** (same inode) or
recreate the container, and check every site it serves afterwards.

Compression and caching are done by the app itself since 2026-11-26 (`serveStatic` in
`server/vite.ts`: brotli/gzip, immutable `/assets/*`, `no-cache` HTML), so the Caddy
`encode` change is no longer needed. Caddy passes the compressed responses through.
