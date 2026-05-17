import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

export function needsMarkdownFix(text: string): boolean {
  if (!text.includes('\\n')) return false
  return (
    text.includes('\\n##') ||
    text.includes('\\n# ') ||
    (text.startsWith('# ') && text.includes('\\n', 0, 300))
  )
}

export function unescapeMarkdown(text: string): string {
  return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"')
}

export function fixMarkdownTree(root: string): string[] {
  const fixed: string[] = []
  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (!entry.name.endsWith('.md')) continue
      const raw = readFileSync(full, 'utf-8')
      if (needsMarkdownFix(raw)) {
        writeFileSync(full, unescapeMarkdown(raw), 'utf-8')
        fixed.push(full)
      }
    }
  }
  walk(root)
  return fixed
}
