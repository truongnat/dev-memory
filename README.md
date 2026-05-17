# Personal KB + Skill Hub

A personal developer platform: **graph-backed knowledge base**, **versioned AI skills**, and a **CLI** that connects your machine to a self-hosted API. Built for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Cursor](https://cursor.com) workflows.

| Layer | Stack | Role |
|-------|--------|------|
| API | NestJS 10 | REST, guards, validation, modules |
| Graph | Neo4j 5.26 | Solutions, skills, tags, relationships |
| Search | Meilisearch | Full-text index |
| Cache | Redis | 5-minute TTL, invalidation on writes |
| CLI | Bun + Commander | `skill` command |
| Proxy | Caddy v2 | Auto-SSL, reverse proxy |
| Infra | Docker Compose | Multi-service orchestration |

**Production:** [dev.truongsoftware.com](https://dev.truongsoftware.com) · API on host port `3456`

---

## Features

- **Knowledge base** — Push markdown solutions; search via Meilisearch; auto-link related solutions by shared tags in Neo4j
- **Skill hub** — Publish, version, and install skill packs (`SKILL.md` + `references/`)
- **Professional skill standard** — Six-layer architecture, `skill validate`, CI on pull requests
- **CLI** — KB search/push, skill install/publish/compose, config management
- **Self-host** — Docker Compose stack, VPS scripts, Caddy SSL

---

## Architecture

```
  CLI (skill) ──HTTPS──▶ Caddy (:443)
                              │
                       NestJS API (:3456)
                         ╱    │    ╲
                   Neo4j  Meilisearch  Redis
                  (graph)   (search)   (cache)
```

**Graph model (summary):** `Solution`, `Skill`, `SkillVersion`, `Tag`, `Project`, `Technology` — with `TAGGED_WITH`, `RELATED_TO`, `HAS_VERSION`, `COMPATIBLE_WITH`, and related edges.

---

## Repository layout

```
apps/api/              NestJS API
packages/cli/          skill CLI (Bun)
skills/                Published skill sources (hub)
templates/skill/       Skill authoring template + brief
scripts/               VPS setup, deploy, backup, publish helpers
SKILL_AUTHORING_RULES.md   Canonical skill structure spec
```

---

## Quick start (CLI)

### Prerequisites

- [Bun](https://bun.sh) 1.0+ or Node.js 18+
- Git

### Install

```bash
git clone https://github.com/truongnat/personal-ai.git
cd personal-ai/packages/cli
bun install
bun run build          # optional: compile dist/skill
# Dev mode (no global link):
bun run src/index.ts -- --help
```

Global install (optional):

```bash
bun build src/index.ts --outfile dist/skill --target node
npm link
skill --version
```

### Configure

```bash
# One-shot (requires API_KEY)
API_KEY=kb_live_your_key make setup-skill-cli

# Or manually
skill config set hub_url https://dev.truongsoftware.com
skill config set api_key kb_live_your_key
skill config set skills_dir ~/.claude/skills
skill config list
```

Generate an API key (master password required):

```bash
curl -X POST https://dev.truongsoftware.com/auth/generate-key \
  -H "x-master-password: YOUR_MASTER_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"label":"my-machine","expiresIn":"365d"}'
```

---

## CLI reference

### Knowledge base

```bash
skill kb search "docker port conflict"
skill kb push ./solution.md --tags "docker,compose" --project personal-ai
skill kb list --tag docker
skill kb get <solution-id>
```

### Skill hub

```bash
skill list
skill info vps-devops-pro
skill install vps-devops-pro
skill publish ./skills/my-skill --compatible "Claude Code,Cursor" --version 1.0.0 --tags "devops"
skill update --all
skill compose --name full-stack --use deploy-workflow --use docker-compose-pro --kb
```

### Skill authoring (local)

```bash
skill new my-domain-pro              # scaffold from templates/skill
skill validate ./skills/my-domain-pro
skill validate-all ./skills --fix    # all skills + repair literal \n corruption
make validate-skills                 # same from repo root
make publish-skills                  # validate + publish manifest (needs API_KEY)
```

---

## Bundled skills

| Skill | Purpose |
|-------|---------|
| `skill-authoring` | Create and validate skills (meta) |
| `kb-workflow` | KB solution discipline |
| `api-design-pro` | NestJS REST, DTOs, guards |
| `nestjs-neo4j-pro` | Neo4j + NestJS integration |
| `bun-cli-pro` | Bun CLI / Commander patterns |
| `docker-compose-pro` | Compose orchestration |
| `vps-devops-pro` | VPS, Caddy, UFW, backups |
| `deploy-workflow` | Deploy/monitor this project's VPS |

Authoring rules: [`SKILL_AUTHORING_RULES.md`](SKILL_AUTHORING_RULES.md) · Template: [`templates/skill/`](templates/skill/)

---

## Development

### Local API

```bash
docker compose up -d neo4j meilisearch redis
cd apps/api && bun install && bun run start:dev
```

### Makefile

| Command | Description |
|---------|-------------|
| `make up` | Start all Docker services |
| `make down` | Stop containers |
| `make logs` | Follow API logs |
| `make build` | Build API image |
| `make deploy` | Deploy to VPS via SSH |
| `make validate-skills` | Validate all skills under `skills/` |
| `make publish-skills` | Publish all skills in `publish-manifest.json` |
| `make setup-skill-cli` | Configure CLI (`API_KEY` required) |

### CI

Pull requests that touch `skills/**` run **skill validation** (structure, frontmatter, section order, reference links). See [`.github/workflows/skills.yml`](.github/workflows/skills.yml).

---

## API overview

| Auth | Header |
|------|--------|
| User | `x-api-key` |
| Admin | `x-master-password` |

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/generate-key`, `GET /auth/keys`, `DELETE /auth/revoke-key/:id` |
| KB | `POST /kb/push`, `GET /kb/search`, `GET /kb/list`, `GET/PATCH/DELETE /kb/:id` |
| Skills | `POST /skill/publish`, `GET /skill/install/:name`, `GET /skill/list`, `GET /skill/:name`, `POST /skill/compose` |

Rate limits: search 2 req/s; general 5 req/s (Throttler).

---

## Self-hosting (VPS)

**Requirements:** Ubuntu 22.04+, 2GB+ RAM, DNS A record to your server.

```bash
git clone https://github.com/truongnat/personal-ai.git /opt/personal-ai
cd /opt/personal-ai
cp .env.example .env   # edit secrets
bash scripts/setup-vps.sh
```

Caddy example:

```caddy
your-domain.com {
    reverse_proxy localhost:3456
    encode gzip zstd
}
```

Deploy updates:

```bash
make deploy
# or on VPS: bash /opt/personal-ai/scripts/deploy.sh
```

Backups: daily cron via `scripts/backup.sh` (7-day retention under `/opt/personal-ai/backups/`).

---

## Solution format

```markdown
# Title

## Problem
...

## Solution
...

## Tags
tag1, tag2
```

Use `templates/solution.md` as a starter. Push with `skill kb push`.

---

## License

Private project · [@truongnat](https://github.com/truongnat)
