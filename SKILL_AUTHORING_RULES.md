# Skill Authoring Rules

Single source of truth for professional skills in this monorepo. Applies to **Claude Code**, **Cursor**, and skills published to the Skill Hub.

**Related:** `skills/skill-authoring/`, `templates/skill/`, `templates/skill/AUTHORING-BRIEF.md`, `templates/skill/CHECKLIST.md`

---

## 1. Skill types and naming

| Type | Suffix | Example | Purpose |
|------|--------|---------|---------|
| Working | `-pro` | `vps-devops-pro` | Domain expertise, patterns, anti-patterns |
| Workflow | `-workflow` | `deploy-workflow`, `kb-workflow` | End-to-end process across tools |
| Meta | `skill-authoring` | `skill-authoring` | Creating and validating skills |

**Rules**

- Folder name **must equal** frontmatter `name` (kebab-case, lowercase, hyphens only).
- Max 64 characters for `name` (Cursor compatibility).
- English in `SKILL.md`; respond to users in their language.

---

## 2. Directory layout

```
skill-name/
├── SKILL.md              # Required; < 500 lines
└── references/           # Optional; deep content
    ├── anti-patterns.md
    ├── decision-tree.md
    ├── edge-cases.md
    └── {topic}.md
```

**Do not** put skills in `~/.cursor/skills-cursor/` (Cursor reserved).

| Location | Use |
|----------|-----|
| `skills/` (this repo) | Source of truth; publish to hub |
| `~/.cursor/skills/` or project `.cursor/skills/` | Installed via `skill install` |
| `.cursor/rules/*.mdc` | Always-on or glob-scoped **rules**, not full skills |

---

## 3. Canonical section order (17 blocks)

Sections must appear in this order. `### Topic (summary)` blocks (layer 4) go **after** `## Anti-patterns` and **before** `## Suggested response format`.

| # | Section | Layer |
|---|---------|-------|
| 1 | YAML frontmatter | Metadata |
| 2 | `# Title (professional)` | Metadata |
| 3 | `## Boundary` | Contract |
| 4 | `## When to use` | Contract |
| 5 | `## When not to use` | Contract |
| 6 | `## Required inputs` | Contract |
| 7 | `## Expected output` | Contract |
| 8 | `## Workflow` | Execution |
| 9 | `### Operating principles` (under Workflow) | Decision |
| 10 | `## Default recommendations by scenario` | Decision |
| 11 | `## Anti-patterns` | Decision |
| 12+ | `### {Topic} (summary)` × N | Knowledge |
| … | `## Suggested response format (implement / review)` | Execution |
| … | `## Resources in this skill` | Knowledge |
| … | `## Quick example` | Execution |
| last | `## Checklist before calling the skill done` | Quality |

---

## 4. Frontmatter (required)

```yaml
---
name: skill-name
description: |
  One-line scope.

  Use this skill when [concrete situations].

  Combine with **`other-skill`** for [integration].

  Triggers: "keyword1", "keyword2", "error message text"

metadata:
  short-description: Domain — key areas
  content-language: en
  domain: category
  level: professional
---
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Matches folder name |
| `description` | Yes | Scope + when + combine-with + `Triggers:` line |
| `metadata.short-description` | Yes | Listing line: `Domain — areas` |
| `metadata.content-language` | No | Default `en` |
| `metadata.domain` | No | e.g. `devops`, `backend` |
| `metadata.level` | No | `foundation` \| `professional` \| `advanced` |

**Description** is the primary routing signal. Include 15–30 triggers: tech names, commands, error strings, question patterns.

**Cursor-only (optional):** `disable-model-invocation: true` if the skill should load only when explicitly named.

---

## 5. Six layers (content expectations)

| Layer | Sections | Requirement |
|-------|----------|-------------|
| **Metadata** | Frontmatter + H1 | Official doc link + what this skill encodes |
| **Contract** | Boundary, When to use/not, Inputs, Output | Explicit defers to other skills by **name** |
| **Decision** | Operating principles, Defaults table, Anti-patterns | 4 Karpathy principles + 1–4 domain principles |
| **Knowledge** | Topic summaries + `references/` | 3–5 bullets per topic; `Details:` link |
| **Execution** | Workflow (3 steps), Response format, Quick example | Confirm → Apply → Respond/Verify |
| **Quality** | Checklist | 4 Karpathy items first, then 3–8 domain checks |

### Workflow (mandatory 3 steps)

1. **Confirm** — versions, environment, constraints; state what to verify.
2. **Apply** — principles + summaries; open `references/` when depth needed; Simplicity First.
3. **Respond** or **Validate** — use Suggested response format; Goal-Driven Execution.

### Suggested response format (mandatory labels)

1. **Issue or goal**
2. **Recommendation**
3. **Code**
4. **Residual risks**

### Karpathy checklist (mandatory, first four items)

- Think Before Coding — assumptions stated; ask when uncertain
- Simplicity First — minimum viable solution
- Surgical Changes — only touch related code/content
- Goal-Driven Execution — success criteria defined and verified

---

## 6. References strategy

**Create `references/` when:**

- Topic exceeds ~20 lines in SKILL.md
- Code examples > ~30 lines
- Decision tree has > 3 branches
- Anti-patterns need worked examples

**Standard files**

| File | Purpose |
|------|---------|
| `anti-patterns.md` | Mistakes + why they fail + fix |
| `decision-tree.md` | If/else choices |
| `edge-cases.md` | Tricky scenarios |
| `{topic}.md` | Domain depth |

**Linking:** Every reference file appears in (1) a `Details: [references/file.md](...)` stanza and (2) the `## Resources in this skill` table.

---

## 7. Cursor rules vs skills

| Use | Mechanism |
|-----|-----------|
| Optional deep workflow | Skill (`SKILL.md`) |
| Always-on discipline | `.mdc` with `alwaysApply: true` |
| File-type conventions | `.mdc` with `globs` |

Template: `templates/cursor-rule.mdc`. One concern per rule.

---

## 8. Quality tiers

| Tier | Criteria |
|------|----------|
| **Minimum** | All sections in order, no placeholders, `skill validate` passes |
| **Professional** | + 2+ reference files, scenario table, quick example, 15+ triggers |
| **Exemplar** | + edge-cases, integration map, tested on 3 real tasks, clear boundaries vs siblings |

---

## 9. Lifecycle commands

```bash
skill new my-domain-pro
skill validate ./skills/my-domain-pro
skill validate-all ./skills --fix          # all hub skills; CI runs this on PR
make validate-skills                       # same from repo root
skill publish ./skills/my-domain-pro --compatible "Claude Code,Cursor" --version 1.0.0 --tags "tag1"
make publish-skills                        # all skills in skills/publish-manifest.json
skill install my-domain-pro
skill info my-domain-pro
```

**Before creating:** `skill kb search "<topic>"` and review existing `skills/` for overlap.

---

## 10. Forbidden patterns

- Monolithic SKILL.md (> 500 lines, no references/)
- Vague triggers: `"backend"`, `"help"`, `"code"`
- Template placeholders left in: `skill-name`, `[scope description]`, `other-skill` without renaming
- Missing `## When not to use` redirects
- Resources table listing files that do not exist
- KB `solution.md` format used as a skill (use `kb-workflow` instead)
- Writing markdown with literal `\n` instead of real line breaks (breaks rendering and `skill validate`)

---

## 11. Claude Code vs Cursor

Both use the same `SKILL.md` + `references/` layout. Author to this document; both tools benefit from concise SKILL.md and progressive disclosure in `references/`.

| Concern | Rule |
|---------|------|
| Discovery | Rich `description` + `Triggers:` |
| Context cost | SKILL.md < 500 lines |
| Install | `skill install` → configured `skills_dir` |
| Explicit-only skill | `disable-model-invocation: true` in frontmatter (Cursor) |

---

## 12. Deep reference docs

| Topic | File |
|-------|------|
| Six layers | `skills/skill-authoring/references/six-layer-architecture.md` |
| Frontmatter | `skills/skill-authoring/references/frontmatter-guide.md` |
| References | `skills/skill-authoring/references/references-strategy.md` |
| Cursor rules | `skills/skill-authoring/references/cursor-rules-format.md` |
| Anti-patterns | `skills/skill-authoring/references/anti-patterns.md` |
