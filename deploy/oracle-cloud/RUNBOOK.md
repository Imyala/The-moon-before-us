# Deploying: GitHub Pages (client) + Oracle Cloud (server)

Two independent pieces:

1. **Client** — static Vite build, served by **GitHub Pages**, deployed automatically by `.github/workflows/deploy-client.yml` on every push to `main`.
2. **Server** — the WebSocket game server + SQLite, deployed by you to an **Oracle Cloud Infrastructure (OCI)** compute instance using the files in `deploy/server/`.

The client is configured at build time (via the `VITE_SERVER_URL` GitHub Actions repo variable) to point at the server's public address, so **set up the server first**, then wire the client to it.

---

## Part 1 — Server on Oracle Cloud

### 1.1 Create the compute instance

1. OCI Console → **Compute → Instances → Create Instance**.
2. Image: **Ubuntu 22.04** (or newer).
3. Shape: the "Always Free" `VM.Standard.A1.Flex` (ARM, up to 4 OCPU / 24 GB free) is plenty for this server. `VM.Standard.E2.1.Micro` (x86, Always Free) also works, just smaller.
4. Networking: use an existing VCN or let OCI create one with a public subnet. Make sure **"Assign a public IPv4 address"** is checked.
5. Add your SSH public key.
6. Create the instance and note its **public IP**.

### 1.2 Open the firewall — both layers

OCI has **two** independent firewalls that both have to allow traffic, and it's the most common reason a freshly-created instance is unreachable:

**A. The VCN Security List / Network Security Group** (cloud-level, in the console):
- Networking → Virtual Cloud Networks → your VCN → Security Lists (or NSGs if you used one).
- Add **Ingress Rules** for:
  - TCP port **22** (SSH) — probably already there.
  - TCP port **80** (HTTP, needed for Let's Encrypt's certificate challenge).
  - TCP port **443** (HTTPS/WSS — this is the port the game actually runs over once deployed).

**B. The instance's own OS firewall** (Ubuntu images on OCI ship `iptables`/`netfilter-persistent` rules that block everything except SSH by default, on top of the console rules above):

```bash
ssh ubuntu@<your-instance-public-ip>

sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 1.3 Point DNS at the instance

Add an **A record** for the domain/subdomain you want the game to live at (e.g. `moon.yourdomain.com`) pointing to the instance's public IP. Wait for it to propagate (`dig moon.yourdomain.com` should return the IP) before continuing — Caddy's automatic TLS needs this to succeed.

If you don't have a domain, get a free one from a dynamic DNS provider, or use your registrar of choice — Caddy just needs *some* publicly-resolvable hostname pointing at the box; it can't get a TLS cert for a bare IP address.

### 1.4 Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# log out and back in for the group change to apply, or:
newgrp docker
```

### 1.5 Get the deployment files onto the instance

```bash
git clone https://github.com/Imyala/The-moon-before-us.git
cd The-moon-before-us
```

(Or `git pull` if you already have a clone — either way you need the **whole repo**, not just `deploy/`, since the server image is built from the repo root so it can reach `packages/shared`.)

### 1.6 Configure the domain

Edit `deploy/server/Caddyfile` and replace `your-domain.example.com` with the real domain from step 1.3.

### 1.7 Build and start

```bash
cd deploy/server
docker compose up -d --build
```

First build takes a few minutes (compiling `better-sqlite3`'s native addon). Watch it come up:

```bash
docker compose logs -f
```

You should see `[moon] server listening on :8787` from the `moon-server` container, and Caddy obtaining a certificate for your domain. Once that settles:

```bash
curl https://moon.yourdomain.com/health
# {"ok":true}
```

That confirms TLS, the reverse proxy, and the game server are all working end to end.

### 1.8 Data persistence and updates

- Character data lives in the `moon-data` Docker volume (SQLite at `/data/moon.sqlite` inside the container), which survives `docker compose down` / rebuilds. Back it up with `docker run --rm -v moon-server_moon-data:/data -v $PWD:/backup alpine tar czf /backup/moon-data-backup.tar.gz -C /data .` if you want an off-box copy.
- To deploy new server code after a `git pull`: `docker compose up -d --build` again — it rebuilds only what changed and restarts with the same data volume.

---

## Part 2 — Client on GitHub Pages

### 2.1 Enable Pages with GitHub Actions as the source

Repo → **Settings → Pages** → under "Build and deployment", set **Source** to **GitHub Actions**. (Don't pick a branch/folder source — the included workflow handles the build and publish itself.)

### 2.2 Point the client at your server

Repo → **Settings → Secrets and variables → Actions → Variables** tab → **New repository variable**:

- Name: `VITE_SERVER_URL`
- Value: `wss://moon.yourdomain.com` (your real domain from step 1.3, `wss://` scheme, **no trailing path**)

This is read at build time by `.github/workflows/deploy-client.yml` and baked into the static client bundle — the client has no other way to find the server, so it won't connect to anything until this is set.

### 2.3 Deploy

The workflow runs automatically on every push to `main` that touches the client/shared packages, or you can trigger it manually: **Actions → "Deploy client to GitHub Pages" → Run workflow**.

Once it finishes, the client is live at:

```
https://<your-github-username>.github.io/The-moon-before-us/
```

(shown as the deployment URL in the workflow run summary, and under Settings → Pages).

### 2.4 Verify end to end

Open the Pages URL, start or join a party. If it can't connect, check in order:
1. Does `https://moon.yourdomain.com/health` return `{"ok":true}` from your own machine? (Confirms the server side is fine.)
2. Browser devtools → Network/Console — is it trying to connect to the right `wss://` URL? (Confirms `VITE_SERVER_URL` was set before the last deploy — it's baked in at build time, so changing the variable requires re-running the workflow.)
3. Any mixed-content or CORS-looking errors in the console almost always mean the domain in `VITE_SERVER_URL` doesn't match the Caddyfile's domain, or DNS/TLS from Part 1 isn't actually working yet.

---

## Summary of what talks to what

```
Player's browser
      │  https://<user>.github.io/The-moon-before-us/   (GitHub Pages — static client)
      │
      │  wss://moon.yourdomain.com                       (baked in via VITE_SERVER_URL)
      ▼
Caddy (OCI instance, ports 80/443, auto TLS)
      │  reverse_proxy → moon-server:8787 (internal docker network)
      ▼
moon-server container (Node/WebSocket, port 8787 not exposed publicly)
      │
      ▼
moon-data volume (SQLite — persists across redeploys)
```
