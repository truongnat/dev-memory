---
name: api-design-pro
description: |
  NestJS REST API design: modules, DTOs with class-validator, guards (API key, master password), throttling, global ValidationPipe, and HTTP error patterns for production APIs.

  Use this skill when designing or reviewing NestJS controllers, DTOs, auth headers, rate limits, or REST endpoints consumed by CLIs and clients.

  Combine with **`nestjs-neo4j-pro`** for graph persistence, **`bun-cli-pro`** for CLI clients calling the API.

  Triggers: "NestJS API", "REST endpoint", "DTO", "ValidationPipe", "ApiKeyGuard", "MasterGuard", "x-api-key", "class-validator", "ThrottlerGuard", "HTTP 401", "controller", "guard"

metadata:
  short-description: API — NestJS REST, DTOs, guards, validation, throttling
  content-language: en
  domain: backend
  level: professional
---

# API Design (professional)

Use official [NestJS docs](https://docs.nestjs.com) and [class-validator](https://github.com/typestack/class-validator) for API truth; this skill encodes **patterns from the Personal KB + Skill Hub API** (`apps/api/`): guards, DTOs, throttling, and safe error responses.

## Boundary

**`api-design-pro`** owns **HTTP API layer design** in NestJS: routes, DTOs, validation, guards, throttling, response shapes, and client auth headers. Defers to **`nestjs-neo4j-pro`** for Cypher/graph logic and **`bun-cli-pro`** for CLI fetch clients.

## When to use

- Adding or reviewing REST endpoints (`@Controller`, `@Get`, `@Post`)
- Designing DTOs with `class-validator` decorators
- API key or master-password authentication
- Global `ValidationPipe` and error handling
- Rate limiting with `@Throttle()`
- Trigger keywords: `NestJS`, `DTO`, `guard`, `x-api-key`, `ValidationPipe`

## When not to use

- **Neo4j/Cypher implementation** — use **`nestjs-neo4j-pro`**
- **CLI command structure** — use **`bun-cli-pro`**
- **Docker/VPS deploy** — use **`deploy-workflow`** / **`vps-devops-pro`**
- **Non-NestJS frameworks** — out of scope

## Required inputs

- **NestJS version** (10.x in this monorepo)
- **Auth model**: user API key (`x-api-key`), admin (`x-master-password`), or public
- **Client type**: CLI, browser, internal service
- **Payload shape** and validation rules

## Expected output

1. **Issue or goal** — endpoint or API change needed
2. **Recommendation** — module placement, guard choice, DTO design
3. **Code** — controller + DTO + guard usage
4. **Residual risks** — auth leaks, validation gaps, throttle bypass

## Workflow

1. **Confirm** auth model, route prefix, and existing module boundaries. Verify: read sibling controllers in `apps/api/src/`.
2. **Apply** DTO + guard + thin controller; business logic in service (**Simplicity First**).
3. **Verify** with curl/CLI: status codes, 401 on missing key, 400 on invalid body (**Goal-Driven Execution**).

### Operating principles

1. **Think Before Coding** — confirm which guard and module own the route.
2. **Simplicity First** — thin controllers; services own logic.
3. **Surgical Changes** — one module per domain (`kb/`, `skill/`, `auth/`).
4. **Goal-Driven Execution** — test happy path + 401 + validation error.
5. **DTOs always validated** — global `ValidationPipe` with `whitelist: true`.
6. **Never leak internals** — generic HTTP errors to clients; log details server-side.
7. **Parameterized persistence** — services use Neo4j params, not string concat in controllers.

## Default recommendations by scenario

| Scenario | Recommendation |
|----------|----------------|
| User-facing CRUD | `@UseGuards(ApiKeyGuard)` + DTO per action |
| Admin-only | `@UseGuards(MasterGuard)` on controller or method |
| Search / expensive read | `@Throttle()` with stricter limits |
| List with pagination | Query params as strings; `parseInt` in controller or transform in DTO |
| Create idempotent resource | Service-level MERGE; return stable id |

## Anti-patterns

- **Logic in controllers** — move to `*.service.ts`
- **Raw body without DTO** — bypasses validation
- **Exposing stack traces** — use Nest `HttpException` subclasses
- **String-built Cypher in controller** — belongs in service with `$params`
- **Missing guard on new routes** — defaults to open unless intentional

Details: [references/anti-patterns.md](references/anti-patterns.md)

### DTOs and validation (summary)

- `VerbNounDto` naming (`PushKbDto`, `PublishSkillDto`)
- Decorators: `@IsString()`, `@IsOptional()`, `@IsArray()`, etc.
- Global pipe: `whitelist`, `transform`, `forbidNonWhitelisted`

Details: [references/dto-validation.md](references/dto-validation.md)

### Guards and auth (summary)

- `x-api-key` → `ApiKeyGuard` (bcrypt compare in Neo4j)
- `x-master-password` → `MasterGuard` for admin routes
- Register shared guards in module; apply per controller

Details: [references/guards-auth.md](references/guards-auth.md)

### Decision tree (summary)

- ApiKey vs Master vs public; throttle or not; sync vs async response

Details: [references/decision-tree.md](references/decision-tree.md)

## Suggested response format (implement / review)

1. **Issue or goal** — API behavior requested
2. **Recommendation** — module, guard, DTO outline
3. **Code** — controller + DTO snippets
4. **Residual risks** — auth, validation edge cases

## Resources in this skill

| Topic | File |
|-------|------|
| DTOs and validation | [references/dto-validation.md](references/dto-validation.md) |
| Guards and auth | [references/guards-auth.md](references/guards-auth.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |

## Quick example

**Input:** "Add authenticated POST /kb/push for markdown solutions"

**Expected output:**

1. Issue or goal: Ingest solution documents with API key auth
2. Recommendation: `KbController` + `PushKbDto` + `ApiKeyGuard`; `KbService.push` handles Neo4j + Meilisearch
3. Code: `@Post('push') push(@Body() dto: PushKbDto)` with `@UseGuards(ApiKeyGuard)` on controller class
4. Residual risks: large payload size — consider body limit; throttle if abused

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum solution; no speculative complexity (Simplicity First)
- [ ] Only touched code/content directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified before marking done (Goal-Driven Execution)
- [ ] DTO validates all inputs; no `any` on request body
- [ ] Correct guard on controller or method
- [ ] Controller delegates to service
- [ ] Errors use `HttpException` subclasses
- [ ] Tested 200, 401, and 400 cases
