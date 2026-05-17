# Anti-patterns

## 1. Fat controllers

**What it looks like:** Cypher, Meilisearch indexing, and cache invalidation all in `@Post()` handler.

**Why it fails:** Untestable, duplicated across endpoints, violates module boundaries.

**Fix:** `KbService.push(dto)` owns orchestration; controller returns result.

## 2. Skipping DTOs

**What it looks like:** `@Body() body: any` or raw `Record<string, unknown>`.

**Why it fails:** No validation; surprise fields; injection-friendly shapes.

**Fix:** Dedicated DTO class with `class-validator` decorators.

## 3. Wrong guard

**What it looks like:** Admin key generation endpoint with only `ApiKeyGuard`, or public search without throttle.

**Fix:** Map route sensitivity → `MasterGuard` vs `ApiKeyGuard` vs throttled public.

## 4. Leaking internal errors

**What it looks like:** `throw err` from Neo4j driver to client.

**Fix:** Log error; throw `InternalServerException` or rethrow as `BadRequestException` when user-fixable.

## 5. Inconsistent route naming

**What it looks like:** `/kb/pushSolution` mixed with `/skill/publish`.

**Fix:** kebab-case paths, plural resources: `/kb`, `/skill`, verb for actions: `push`, `publish`.
