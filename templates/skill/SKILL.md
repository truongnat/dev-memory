---
name: skill-name
description: |
  One-line professional scope for this skill.

  Use this skill when ... (concrete situations, stack, user asks).

  Triggers: "keyword1", "keyword2", "keyword3"

metadata:
  short-description: Domain — key areas
  content-language: en
  domain: category
  level: professional
---

# Skill Display Name (professional)

> **Authoring:** Fill `AUTHORING-BRIEF.md` first. Rules: [`SKILL_AUTHORING_RULES.md`](../../SKILL_AUTHORING_RULES.md). Checklist: `CHECKLIST.md`. Validate: `skill validate .`

Use official [Primary docs](https://example.com) for API truth; this skill encodes **professional defaults**, **patterns**, and **anti-patterns**. Confirm **version** / **environment** from the project when known.

## Boundary

**`skill-name`** owns **[scope description]**. Defers to **`other-skill`** for [out-of-scope areas].

## When to use

- Scenario one
- Scenario two
- Trigger keywords: `keyword1`, `keyword2`, `keyword3`

## When not to use

- **Out-of-scope topic** — use **`other-skill-pro`** instead.
- **Different context** — not covered here.

## Required inputs

- **Version/environment** info needed to give accurate guidance.

## Expected output

1. **Issue or goal** — what was asked
2. **Recommendation** — professional guidance
3. **Code** — implementation
4. **Residual risks** — what to watch for

## Workflow

1. **Confirm** versions / environment / stack / constraints. Verify: [specific checks].
2. **Apply** principles and topic summaries below; open `references/` when depth is needed. Start with minimum solution; escalate only when justified (**Simplicity First**).
3. **Respond** using Suggested response format; define success criteria and verify (**Goal-Driven Execution**).

### Operating principles

1. **Think Before Coding** — state assumptions explicitly; ask when uncertain.
2. **Simplicity First** — minimum viable solution; no speculative complexity.
3. **Surgical Changes** — only touch code directly related to the request.
4. **Goal-Driven Execution** — define success criteria; loop until verified.
5. **[Domain principle]** — specific to this skill's domain.

## Default recommendations by scenario

| Scenario | Recommendation |
|----------|---------------|
| Greenfield | ... |
| Existing codebase | ... |
| Performance issue | ... |

## Anti-patterns

- **Anti-pattern name** — what it looks like, why it fails.
- **Anti-pattern name** — what it looks like, why it fails.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Topic area (summary)

- Key point one
- Key point two
- Key point three

Details: [references/topic-file.md](references/topic-file.md)

## Suggested response format (implement / review)

1. **Issue or goal** — restate the problem clearly
2. **Recommendation** — professional guidance with rationale
3. **Code** — implementation snippets, commands, or config
4. **Residual risks** — what could go wrong, what to monitor

## Resources in this skill

| Topic | File |
|-------|------|
| Topic A | [references/topic-file.md](references/topic-file.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |

## Quick example

**Input:** "How do I [specific task]?"

**Expected output:**
1. Issue or goal: [restatement]
2. Recommendation: [guidance]
3. Code: [snippet]
4. Residual risks: [considerations]

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum solution; no speculative complexity (Simplicity First)
- [ ] Only touched code/content directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified before marking done (Goal-Driven Execution)
- [ ] Frontmatter `description` states when to trigger; `name` matches folder name
- [ ] Section order matches SKILL_AUTHORING_RULES.md
- [ ] Long docs live in `references/`, not pasted into SKILL.md
- [ ] Resources table matches actual files in references/
