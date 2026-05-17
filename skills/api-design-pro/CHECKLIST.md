# Skill validation checklist

Run: `skill validate ./skills/<name>`

Manual review after automated checks pass.

## Structure

- [ ] Folder name equals frontmatter `name` (kebab-case)
- [ ] All sections in order per `SKILL_AUTHORING_RULES.md` §3
- [ ] `SKILL.md` under 500 lines
- [ ] `### Operating principles` nested under `## Workflow`
- [ ] No template placeholders (`api-design-pro`, `[scope`, `other-skill` as generic defer)

## Frontmatter

- [ ] `description` has: scope line, "Use this skill when", `Triggers:` with 15+ terms
- [ ] `metadata.short-description` set
- [ ] Official doc link in intro paragraph (when applicable)

## Contract

- [ ] `## Boundary` names this skill and defers by skill name
- [ ] `## When not to use` redirects to other skills
- [ ] `## Expected output` matches Suggested response format

## Knowledge

- [ ] Each `references/*.md` linked in a `Details:` stanza
- [ ] `## Resources in this skill` table matches files on disk
- [ ] No reference file orphaned (on disk but not linked)

## Quality (Karpathy — mandatory first four)

- [ ] Assumptions stated; ask when uncertain (Think Before Coding)
- [ ] Minimum solution; no speculative complexity (Simplicity First)
- [ ] Only relevant code/content touched (Surgical Changes)
- [ ] Success criteria defined and verified (Goal-Driven Execution)
- [ ] Domain-specific checklist items added (3–8)

## Publish

- [ ] `skill validate` exits 0
- [ ] `skill publish` succeeds
- [ ] `skill info <name>` shows correct metadata
- [ ] Tested on one real task
