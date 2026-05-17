---
name: kb-workflow
description: |
  Knowledge Base lifecycle: search existing solutions before work, write structured solutions after solving problems, push with rich metadata for graph discovery.

  Use this skill when saving a solution, documenting a fix, searching for existing knowledge, or managing the personal KB. Also use before starting new work to check what already exists.

  Triggers: "kb", "knowledge base", "solution", "push", "search knowledge", "save this", "document this", "write solution", "skill kb"

metadata:
  short-description: KB — search, write, push, graph-linked solutions
  content-language: en
  domain: knowledge-management
  level: professional
---

# KB Workflow (professional)

This skill encodes the **search-first discipline**, **structured solution format**, and **rich tagging strategy** for the Personal KB system. The KB uses Neo4j (graph relationships), Meilisearch (full-text search), and Redis (cache). Confirm the **project name** and **relevant tags** from context.

## Boundary

**`kb-workflow`** owns the **solution lifecycle**: searching, writing, pushing, updating, and deleting KB entries. Defers to **`skill-authoring`** for creating skill files (SKILL.md), and to **`deploy-workflow`** for VPS operations.

## When to use

- Before starting new work (search first — avoid reinventing)
- After solving a bug, infrastructure issue, or discovering a pattern
- After completing a ticket or feature
- When someone asks "how did we solve X before?"
- When documenting a decision or trade-off
- Trigger keywords: `kb`, `solution`, `push`, `search`, `document`

## When not to use

- **Creating skill files** (SKILL.md format) — use **`skill-authoring`**
- **Deployment operations** — use **`deploy-workflow`**
- **General note-taking** without problem/solution structure — not suitable for KB

## Required inputs

- **Topic/problem** being documented or searched
- **Project name** (for tagging: e.g., "personal-ai")
- **Tags** (comma-separated, drives graph auto-linking)

## Expected output

For **search**: list of matching solutions with titles, tags, and relevance
For **push**: confirmation with ID and count of auto-linked related solutions
For **write**: structured markdown following the solution format

## Workflow

1. **Search first** — run `skill kb search "topic"` to check for existing solutions. Verify: no duplicate exists, or existing solution needs updating rather than new entry.
2. **Write solution** — follow the canonical format (Problem → Solution → Key Insight → Tags → Technologies). Start minimal (**Simplicity First**); add depth only if the problem warrants it.
3. **Push with metadata** — `skill kb push ./solution.md --tags "tag1,tag2" --project "project-name"`. Verify: response shows ID and related_found count. Check that tags are rich enough for graph connections (**Goal-Driven Execution**).

### Operating principles

1. **Think Before Coding** — search the KB before implementing. The solution may already exist.
2. **Simplicity First** — one solution per problem. Don't combine unrelated fixes in one entry.
3. **Surgical Changes** — update existing solutions rather than creating near-duplicates.
4. **Goal-Driven Execution** — after pushing, verify with `skill kb search` that it is discoverable.
5. **Tag richly** — tags drive RELATED_TO auto-linking. More relevant tags = better graph connectivity.
6. **Include code** — solutions without code examples are incomplete for developer KB.
7. **Vietnamese acceptable** — solution content may be in Vietnamese; tags should be English for searchability.

## Default recommendations by scenario

| Scenario | Format |
|----------|--------|
| Bug fix | Problem (with error message) → Root cause → Fix (with code) → Prevention |
| Infrastructure | Context → Steps taken → Final working config → Gotchas |
| Pattern/technique | When to use → Implementation → Trade-offs → Alternatives |
| Decision record | Context → Options considered → Decision → Rationale |

## Anti-patterns

- **No tags** — solution is orphaned, never discovered via graph traversal
- **Wall of text** — missing structure makes scanning impossible
- **Duplicate entries** — didn't search first; fragments knowledge
- **Overly broad** — "How to use Docker" is not a solution; be specific

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Solution format (summary)

Every solution follows: H1 Title → Problem → Solution (with code) → Key Insight → Tags → Technologies. The H1 becomes the title in the KB. Tags are comma-separated and drive graph relationships.

Details: [references/solution-format.md](references/solution-format.md)

### Search strategies (summary)

- Use specific terms, not generic ("neo4j constraint order" not "database")
- Filter by tag or project for narrower results
- Second search returns `cached: true` (Redis 5-min cache)
- Graph traversal: related solutions share tags automatically

Details: [references/search-strategies.md](references/search-strategies.md)

### Graph relationships (summary)

Solutions auto-link via `RELATED_TO` when they share tags. Richer tagging = more connections. Tags, Projects, and Technologies are separate nodes enabling multi-dimensional traversal.

Details: [references/graph-relationships.md](references/graph-relationships.md)

## Suggested response format (implement / review)

1. **Issue or goal** — what problem was solved or what knowledge to capture
2. **Recommendation** — push as new solution, update existing, or consolidate duplicates
3. **Code** — the solution.md content formatted correctly
4. **Residual risks** — missing tags, potential duplicates, incomplete examples

## Resources in this skill

| Topic | File |
|-------|------|
| Solution format | [references/solution-format.md](references/solution-format.md) |
| Search strategies | [references/search-strategies.md](references/search-strategies.md) |
| Graph relationships | [references/graph-relationships.md](references/graph-relationships.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |

## Quick example

**Input:** "I just fixed a NestJS race condition where onModuleInit hooks fired concurrently. Save this to the KB."

**Expected output:**
1. Issue or goal: Document the NestJS initialization race condition fix
2. Recommendation: Push as new solution with tags: nestjs, race-condition, initialization, neo4j
3. Code: Write solution.md with Problem (concurrent onModuleInit), Solution (centralize in lowest service), Key Insight (NestJS doesn't guarantee init order)
4. Residual risks: Check for existing "nestjs init" solutions first; ensure tags overlap with related entries

**Commands:**
```bash
skill kb search "nestjs initialization"    # Check existing
skill kb push ./nestjs-race-fix.md --tags "nestjs,race-condition,initialization,neo4j" --project "personal-ai"
```

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum solution; no speculative complexity (Simplicity First)
- [ ] Only touched code/content directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified before marking done (Goal-Driven Execution)
- [ ] Searched KB before pushing (no duplicates created)
- [ ] Solution follows canonical format (Problem → Solution → Key Insight → Tags)
- [ ] Tags are rich and specific (not just "fix" or "code")
- [ ] Code examples included where relevant
- [ ] Verified solution is discoverable via `skill kb search`
