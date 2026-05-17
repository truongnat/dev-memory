import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function humanizeSkillName(kebab: string): string {
  return kebab
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function replaceInTree(dir: string, replacements: [string, string][]) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      replaceInTree(full, replacements)
      continue
    }
    if (!entry.name.endsWith('.md') && !entry.name.endsWith('.mdc')) continue
    let text = readFileSync(full, 'utf-8')
    for (const [from, to] of replacements) {
      text = text.split(from).join(to)
    }
    writeFileSync(full, text, 'utf-8')
  }
}

export function scaffoldSkill(templateDir: string, targetDir: string, name: string): string[] {
  if (!KEBAB_RE.test(name)) {
    throw new Error('Skill name must be kebab-case (lowercase letters, numbers, hyphens)')
  }
  if (existsSync(targetDir)) {
    throw new Error(`Target already exists: ${targetDir}`)
  }
  if (!existsSync(join(templateDir, 'SKILL.md'))) {
    throw new Error(`Template not found: ${templateDir}`)
  }

  cpSync(templateDir, targetDir, { recursive: true })

  const display = `${humanizeSkillName(name)} (professional)`
  const shortDesc = `${humanizeSkillName(name)} — key areas`

  replaceInTree(targetDir, [
    ['skill-name', name],
    ['Skill Display Name (professional)', display],
    ['Domain — key areas', shortDesc],
    ['One-line professional scope for this skill.', `Professional patterns for ${humanizeSkillName(name)}.`],
    ['category', 'general'],
  ])

  return [
    targetDir,
    join(targetDir, 'SKILL.md'),
    join(targetDir, 'AUTHORING-BRIEF.md'),
    join(targetDir, 'CHECKLIST.md'),
    join(targetDir, 'references'),
  ]
}

export function repoRootFromCliSrc(): string {
  return join(new URL('.', import.meta.url).pathname, '../../..')
}
