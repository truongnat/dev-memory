import { readFileSync, readdirSync } from 'fs'
import { basename, join } from 'path'

export type SkillPackage = {
  name: string
  version: string
  description: string
  compatible: string[]
  files: Record<string, string>
  tags: string[]
}

function parseFrontmatterBlock(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match ? match[1] : null
}

export function parseFrontmatterName(content: string): string | null {
  const block = parseFrontmatterBlock(content)
  if (!block) return null
  const m = block.match(/^name:\s*(.+)$/m)
  return m ? m[1].trim() : null
}

export function parseFrontmatterDescription(content: string): string {
  const block = parseFrontmatterBlock(content)
  if (!block) {
    const title = content.match(/^#\s+(.+)/m)
    return title?.[1]?.trim() ?? ''
  }

  const short = block.match(/^metadata:\s*\n[\s\S]*?short-description:\s*(.+)$/m)
  if (short) return short[1].trim()

  const descMatch = block.match(/^description:\s*\|\s*\n([\s\S]*?)(?=\n[a-z_]+:|\n---|$)/m)
  if (descMatch) {
    const firstLine = descMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.length > 0)
    if (firstLine) return firstLine
  }

  const descInline = block.match(/^description:\s*(.+)$/m)
  if (descInline) return descInline[1].trim()

  const title = content.match(/^#\s+(.+)/m)
  return title?.[1]?.trim() ?? ''
}

export function readSkillDir(dir: string): SkillPackage {
  const skillMdPath = join(dir, 'SKILL.md')
  const skillMd = readFileSync(skillMdPath, 'utf-8')
  const name = parseFrontmatterName(skillMd) ?? basename(dir)
  const description = parseFrontmatterDescription(skillMd)

  const files: Record<string, string> = {}
  function readDirRecursive(d: string, prefix = '') {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        readDirRecursive(join(d, entry.name), `${prefix}${entry.name}/`)
      } else {
        const relPath = `${prefix}${entry.name}`
        files[relPath] = readFileSync(join(d, entry.name), 'utf-8')
      }
    }
  }
  readDirRecursive(dir)

  return {
    name,
    version: '1.0.0',
    description,
    compatible: ['Claude Code', 'Cursor'],
    files,
    tags: [],
  }
}
