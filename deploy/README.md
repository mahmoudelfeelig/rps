# Hetzner Deploy

Production runs as one Docker app stack behind one Caddy ingress on the Hetzner server.
Cloudflare only manages DNS and optional proxying for `rps.elfeel.me`.

## Target Setup

```text
Cloudflare DNS -> Hetzner VPS -> Caddy -> frontend container
                                      -> backend API container
                                      -> /data/uploads volume

MongoDB: Atlas
Email: Brevo SMTP
```

Use one public hostname:

```text
rps.elfeel.me
```

The frontend calls `/api`. Caddy routes API and uploaded media requests to the backend.

## Server Layout

```text
/opt/caddy
/opt/rps
```

## Cloudflare DNS

Create an `A` record:

```text
rps -> your Hetzner IPv4
```

Recommended settings:

```text
Proxy status: Proxied or DNS only
SSL/TLS mode: Full (strict)
```

If Caddy certificate issuance fails while proxied, switch the record to DNS only, let Caddy issue the certificate, then proxy it again.

## One-Time Server Setup

Install Docker and the Compose plugin on the Hetzner server, then create the shared network:

```bash
docker network create web
```

Create the public Caddy stack:

```bash
mkdir -p /opt/caddy
cd /opt/caddy
nano docker-compose.yml
nano Caddyfile
```

Use `deploy/caddy/docker-compose.yml.example` for `/opt/caddy/docker-compose.yml`.
Use `deploy/Caddyfile.example` for `/opt/caddy/Caddyfile`.

Start Caddy:

```bash
cd /opt/caddy
docker compose up -d
```

## App Setup

Clone the repo:

```bash
cd /opt
git clone https://github.com/mahmoudelfeelig/rps.git rps
cd /opt/rps
```

Create the production env file:

```bash
cp deploy/.env.example deploy/.env
nano deploy/.env
```

Required values:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=use-a-long-random-secret
FRONTEND_URL=https://rps.elfeel.me
CORS_ORIGINS=https://rps.elfeel.me

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_login
SMTP_PASS=your_brevo_smtp_password
EMAIL_FROM="RPS <no-reply@elfeel.me>"
EMAIL_VERIFY_BASE_URL=https://rps.elfeel.me/verify-email
PASSWORD_RESET_BASE_URL=https://rps.elfeel.me/reset-password

UPLOAD_STORAGE_DIR=/data/uploads
```

Start the app stack:

```bash
docker compose -p rps --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build --remove-orphans
```

If you previously started this stack without `-p rps`, the old `deploy-*` containers can collide with other apps that also use a `deploy` compose folder. Start RPS with `-p rps` from now on.

```bash
cd /opt/rps
docker compose -p rps --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d --build --remove-orphans
```

Reload Caddy after changing `/opt/caddy/Caddyfile`:

```bash
cd /opt/caddy
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## MongoDB Atlas

For lowest ops, keep MongoDB on Atlas instead of self-hosting it.

Setup:

1. Create an Atlas cluster.
2. Create a database user.
3. Allow your Hetzner server IP in Atlas Network Access.
4. Put the Atlas connection string in `deploy/.env` as `MONGO_URI`.

Self-hosting MongoDB on Hetzner is possible, but it adds backup, update, monitoring, disk, and security work. Atlas is the better default for this project.

## Uploads

Uploaded images and GIFs are stored on the Hetzner Docker volume mounted at:

```text
/data/uploads inside the API container
```

Caddy exposes them through:

```text
https://rps.elfeel.me/uploads/...
```

Back up this Docker volume regularly. If you later want S3-compatible storage, add it as a separate upload adapter instead of carrying unused env values.

## GitHub Actions Deploy

The deploy workflow runs on every push to `main`.

Add these repository secrets:

```text
HETZNER_HOST=server-ip-or-hostname
HETZNER_USER=deploy
HETZNER_PATH=/opt/rps
HETZNER_SSH_KEY=private key for the deploy user
```

The deploy user needs read access to the repo and permission to run Docker commands.

## Smoke Tests

After deploy:

```bash
curl -I https://rps.elfeel.me
curl -I https://rps.elfeel.me/api/health
```
