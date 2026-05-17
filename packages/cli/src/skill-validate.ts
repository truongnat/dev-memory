import { existsSync, readFileSync, readdirSync } from 'fs'
import { basename, join } from 'path'

const REQUIRED_SECTIONS = [
  'Boundary',
  'When to use',
  'When not to use',
  'Required inputs',
  'Expected output',
  'Workflow',
  'Default recommendations by scenario',
  'Anti-patterns',
  'Suggested response format',
  'Resources in this skill',
  'Quick example',
  'Checklist before calling the skill done',
] as const

const PLACEHOLDER_PATTERNS: { pattern: RegExp; message: string }[] = [
  { pattern: /\*\*`skill-name`\*\*/, message: 'Placeholder skill-name in Boundary' },
  { pattern: /\[scope description\]/i, message: 'Placeholder [scope description]' },
  { pattern: /\*\*`other-skill`\*\*/, message: 'Placeholder other-skill (rename to real skill)' },
  { pattern: /\[out-of-scope areas\]/i, message: 'Placeholder [out-of-scope areas]' },
  { pattern: /\{Anti-pattern name\}/, message: 'Placeholder {Anti-pattern name} in anti-patterns' },
  { pattern: /# Skill Display Name \(professional\)/, message: 'Template title not replaced' },
  { pattern: /One-line professional scope for this skill/, message: 'Template description not replaced' },
]

export type ValidateResult = { ok: boolean; errors: string[]; warnings: string[] }

export type ValidateAllResult = {
  ok: boolean
  results: { dir: string; name: string; result: ValidateResult }[]
}

function parseFrontmatterName(content: string): string | null {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---/)
  if (!match) return null
  const block = match[0]
  const nameMatch = block.match(/^name:\s*(.+)$/m)
  return nameMatch ? nameMatch[1].trim() : null
}

function sectionIndices(content: string): Map<string, number> {
  const indices = new Map<string, number>()
  const re = /^## (.+)$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const title = m[1].trim()
    if (!indices.has(title)) indices.set(title, m.index)
  }
  return indices
}

function listReferenceFiles(skillDir: string): string[] {
  const refDir = join(skillDir, 'references')
  if (!existsSync(refDir)) return []
  return readdirSync(refDir).filter((f) => f.endsWith('.md')).map((f) => `references/${f}`)
}

export function validateSkillDir(skillDir: string): ValidateResult {
  const errors: string[] = []
  const warnings: string[] = []
  const skillMdPath = join(skillDir, 'SKILL.md')

  if (!existsSync(skillMdPath)) {
    return { ok: false, errors: ['Missing SKILL.md'], warnings: [] }
  }

  const content = readFileSync(skillMdPath, 'utf-8')
  const folderName = basename(skillDir)
  const frontmatterName = parseFrontmatterName(content)

  if (!frontmatterName) {
    errors.push('Missing YAML frontmatter or name field')
  } else if (frontmatterName !== folderName) {
    errors.push(`Frontmatter name "${frontmatterName}" does not match folder "${folderName}"`)
  }

  if (!content.includes('description:')) {
    errors.push('Missing description in frontmatter')
  }
  if (!/Triggers:/i.test(content)) {
    warnings.push('No Triggers: line found in frontmatter description')
  }

  const lineCount = content.split('\n').length
  if (lineCount > 500) {
    errors.push(`SKILL.md is ${lineCount} lines (max 500)`)
  }

  const indices = sectionIndices(content)

  function findSectionIndex(required: string): number | undefined {
    const exact = indices.get(required)
    if (exact !== undefined) return exact
    for (const [title, idx] of indices) {
      if (title.startsWith(required)) return idx
    }
    return undefined
  }

  let lastIndex = -1
  for (const section of REQUIRED_SECTIONS) {
    const idx = findSectionIndex(section)
    if (idx === undefined) {
      errors.push(`Missing section: ## ${section}`)
      continue
    }
    if (idx < lastIndex) {
      errors.push(`Section out of order: ## ${section}`)
    }
    lastIndex = idx
  }

  const workflowIdx = indices.get('Workflow')
  const principlesIdx = content.indexOf('### Operating principles')
  if (workflowIdx !== undefined && principlesIdx !== -1 && principlesIdx < workflowIdx) {
    errors.push('### Operating principles must appear under ## Workflow')
  }
  if (principlesIdx === -1) {
    errors.push('Missing ### Operating principles')
  }

  for (const { pattern, message } of PLACEHOLDER_PATTERNS) {
    if (pattern.test(content)) errors.push(message)
  }

  const karpathy = [
    'Think Before Coding',
    'Simplicity First',
    'Surgical Changes',
    'Goal-Driven Execution',
  ]
  for (const k of karpathy) {
    if (!content.includes(k)) warnings.push(`Checklist may be missing Karpathy item: ${k}`)
  }

  const onDisk = new Set(listReferenceFiles(skillDir))
  const linked = new Set<string>()

  const detailsRe = /^Details:\s*\[references\/([^\]]+)\]\(references\/[^)]+\)/gm
  let detailsMatch: RegExpExecArray | null
  while ((detailsMatch = detailsRe.exec(content)) !== null) {
    linked.add(`references/${detailsMatch[1]}`)
  }

  const tableRe = /\|\s*[^|]+\s*\|\s*\[references\/([^\]]+)\]/g
  let tableMatch: RegExpExecArray | null
  while ((tableMatch = tableRe.exec(content)) !== null) {
    linked.add(`references/${tableMatch[1]}`)
  }

  for (const f of onDisk) {
    if (!linked.has(f)) warnings.push(`Reference file not linked in SKILL.md: ${f}`)
  }
  for (const f of linked) {
    if (!existsSync(join(skillDir, f))) errors.push(`Linked reference missing on disk: ${f}`)
  }

  return { ok: errors.length === 0, errors, warnings }
}

export function validateAllSkills(skillsRoot: string): ValidateAllResult {
  const results: ValidateAllResult['results'] = []

  if (!existsSync(skillsRoot)) {
    return {
      ok: false,
      results: [
        {
          dir: skillsRoot,
          name: '',
          result: { ok: false, errors: ['Skills directory not found'], warnings: [] },
        },
      ],
    }
  }

  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const dir = join(skillsRoot, entry.name)
    if (!existsSync(join(dir, 'SKILL.md'))) continue
    results.push({ dir, name: entry.name, result: validateSkillDir(dir) })
  }

  return { ok: results.every((r) => r.result.ok), results }
}
