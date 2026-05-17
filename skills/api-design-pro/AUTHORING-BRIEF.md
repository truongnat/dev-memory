# Skill Authoring Brief

Fill this **before** drafting `SKILL.md`. Delete sections you do not need. See `SKILL_AUTHORING_RULES.md`.

---

## Identity

| Field | Value |
|-------|-------|
| **name** (folder) | |
| **display title** | |
| **type** | working (`-pro`) / workflow (`-workflow`) / meta |
| **domain** (`metadata.domain`) | |
| **compatible** | Claude Code, Cursor |
| **version** (initial) | 1.0.0 |

---

## Purpose (one sentence)

What should the agent be able to do after loading this skill that it cannot do reliably without it?

---

## Boundary

**Owns:**

-

**Defers to** (skill name → reason):

| Skill | Reason |
|-------|--------|
| | |

---

## Triggers (15–30)

Paste phrases users type, tech names, commands, and error messages:

```
"
"
```

---

## Required inputs

What must the agent confirm before giving advice?

-

---

## Reference file plan

| File | Topic | Create now? |
|------|-------|-------------|
| `references/anti-patterns.md` | | yes / later |
| `references/decision-tree.md` | | yes / later |
| `references/edge-cases.md` | | yes / skip |
| `references/________.md` | | |

---

## Topic summaries (for SKILL.md)

List `### Topic (summary)` blocks to add (3–5 bullets each in draft):

1.
2.
3.

---

## Scenario table (Default recommendations)

| Scenario | Recommendation |
|----------|----------------|
| | |

---

## Quick example (sketch)

**User input:**

**Expected output:** Issue → Recommendation → Code → Risks

---

## Success criteria

How will you verify this skill works? (real task to run after publish)

1.

---

## Overlap check

- [ ] Searched KB: `skill kb search "..."`
- [ ] Reviewed existing skills in `skills/`
- [ ] No duplicate scope without clear boundary
