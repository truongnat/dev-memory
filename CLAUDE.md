# Personal KB + Skill Hub

A monorepo personal developer platform: graph-backed knowledge base + versioned AI skill management.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API | NestJS 10 | REST API, guards, pipes, DI |
| Graph DB | Neo4j 5.26 Community | Solutions, skills, relationships |
| Search | Meilisearch | Full-text indexing |
| Cache | Redis (ioredis) | 5-min TTL, search cache |
| CLI | Bun + Commander | `skill` command |
| Proxy | Caddy v2 | Auto-SSL, reverse proxy |
| Infra | Docker Compose | Multi-service orchestration |

## Architecture

```
CLI (skill) ──HTTPS──▶ Caddy (auto-SSL)
                            │
                       KB API (NestJS :3456)
                      ╱       │        ╲
               Neo4j      Meilisearch    Redis
             (graph)       (search)     (cache)
```

## Directory Structure

```
apps/api/src/
├── neo4j/       Neo4j driver wrapper, ALL constraint creation centralized here
├── search/      Meilisearch client wrapper
├── cache/       Redis cache (get/set/del/delByPattern)
├── auth/        API key generation, bcrypt hashing, master guard
├── kb/          Solution CRUD + auto-linking + search with cache
└── skill/       Skill publish/install/compose/version management

packages/cli/src/
├── commands/    kb (search/push/list/get), skill (install/publish/compose)
├── api.ts       Typed fetch wrapper with x-api-key header
└── config.ts    Conf-based persistent config (~/.skill-cli/config.json)

skills/          Publishable skill files (SKILL.md + references/)
templates/       Starter templates for solutions, skills, cursor rules
scripts/         VPS provisioning, deploy, backup
```

## Graph Schema

**Nodes**: Solution, Skill, SkillVersion, Tag, Project, Technology, AITool, ApiKey

**Relationships**:
- `(Solution)-[:TAGGED_WITH]->(Tag)`
- `(Solution)-[:BELONGS_TO]->(Project)`
- `(Solution)-[:USES]->(Technology)`
- `(Solution)-[:RELATED_TO]->(Solution)` — auto-linked by shared tags
- `(Skill)-[:HAS_VERSION]->(SkillVersion)`
- `(Skill)-[:COMPATIBLE_WITH]->(AITool)`

## Conventions

### Files & Naming
- **Files**: kebab-case (`kb.service.ts`, `api-key.guard.ts`)
- **Classes**: PascalCase (`KbService`, `ApiKeyGuard`)
- **Methods**: camelCase (`generateKey`, `delByPattern`)
- **Modules**: one per domain, `@Global()` only for shared (Neo4j, Cache, Search)

### NestJS Patterns
- Guards via `CanActivate` — `MasterGuard` (admin), `ApiKeyGuard` (user)
- DTOs with `class-validator` decorators, `ValidationPipe` global
- ThrottlerGuard as APP_GUARD; override per-route with `@Throttle()`
- All Neo4j constraints created in `Neo4jService.onModuleInit()` (prevents race conditions)

### Neo4j / Cypher
- Always parameterized queries (`$param`, never string interpolation)
- `MERGE` for idempotency, `ON CREATE SET` before `SET`
- Use `neo4j.int()` for SKIP/LIMIT integer parameters
- Constraints: `CREATE CONSTRAINT ... IF NOT EXISTS`

### API Auth
- Admin routes: `x-master-password` header → `MasterGuard`
- User routes: `x-api-key` header → `ApiKeyGuard`
- Keys: `kb_live_<32-hex>`, bcrypt-hashed in Neo4j, raw shown only at generation

## Development

```bash
make up           # Start all Docker containers
make down         # Stop all containers
make logs         # Follow API logs
make build        # Build API Docker image
make deploy       # Deploy to VPS via SSH
```

Local dev (without Docker for API):
```bash
docker compose up -d neo4j meilisearch redis
cd apps/api && bun run start:dev
```

## Deploy

VPS: `62.146.238.102` | Domain: `dev.truongsoftware.com` | Caddy auto-SSL

```bash
make deploy       # git pull → build → restart → health check
# Or: ssh root@62.146.238.102 "bash /opt/personal-ai/scripts/deploy.sh"
```

## KB Discipline

1. **Before work**: `skill kb search "topic"` — check existing solutions
2. **After solving**: write solution.md, `skill kb push ./solution.md --tags x,y --project personal-ai`
3. Tag richly — tags drive RELATED_TO auto-linking in the graph

## Skill Publishing

```bash
skill publish ./skills/my-skill --compatible "Claude Code,Cursor" --version 1.0.0 --tags "tag1,tag2"
skill install my-skill          # Writes to .claude/skills/my-skill/
skill compose --name combo --use skill1 --use skill2 --kb
```
