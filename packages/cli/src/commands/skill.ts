import { Command } from 'commander'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { api } from '../api'
import { getConfig } from '../config'
import { fixMarkdownTree } from '../skill-markdown-fix'
import { readSkillDir } from '../skill-read'
import { repoRootFromCliSrc, scaffoldSkill } from '../skill-scaffold'
import { validateAllSkills, validateSkillDir } from '../skill-validate'

function writeSkillFiles(skill: any) {
  const config = getConfig()
  const baseDir = resolve(config.skills_dir.replace('~', process.env.HOME ?? ''))
  const skillDir = join(baseDir, skill.name)
  mkdirSync(skillDir, { recursive: true })

  for (const [filePath, content] of Object.entries(skill.files as Record<string, string>)) {
    const fullPath = join(skillDir, filePath)
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))
    if (dir) mkdirSync(dir, { recursive: true })
    writeFileSync(fullPath, content, 'utf-8')
  }
}

export function registerSkillCommands(program: Command) {
  program
    .command('new <name>')
    .description('Scaffold a new skill from templates/skill')
    .option('--dir <path>', 'output directory (default: skills/<name> in repo root)')
    .action((name: string, opts: { dir?: string }) => {
      try {
        const root = repoRootFromCliSrc()
        const templateDir = join(root, 'templates/skill')
        const targetDir = opts.dir ? resolve(opts.dir) : join(root, 'skills', name)
        const created = scaffoldSkill(templateDir, targetDir, name)
        console.log(chalk.green(`Created skill scaffold: ${targetDir}`))
        for (const p of created) console.log(chalk.dim(`  ${p}`))
        console.log(chalk.yellow('\nNext: fill AUTHORING-BRIEF.md, then SKILL.md, then run:'))
        console.log(chalk.dim(`  skill validate ${targetDir}`))
      } catch (err: any) {
        console.error(chalk.red(err.message))
        process.exit(1)
      }
    })

  program
    .command('validate <dir>')
    .description('Validate skill structure (SKILL_AUTHORING_RULES)')
    .option('--fix', 'fix literal \\n corruption in markdown before validating')
    .action((dir: string, opts: { fix?: boolean }) => {
      const resolved = resolve(dir)
      if (opts.fix) {
        const fixed = fixMarkdownTree(resolved)
        for (const f of fixed) console.log(chalk.dim(`fixed: ${f}`))
      }
      const result = validateSkillDir(resolved)
      for (const w of result.warnings) console.log(chalk.yellow(`warn: ${w}`))
      for (const e of result.errors) console.log(chalk.red(`error: ${e}`))
      if (result.ok) {
        console.log(chalk.green('Validation passed'))
      } else {
        process.exit(1)
      }
    })

  program
    .command('validate-all [skillsDir]')
    .description('Validate every skill under skills/ (default: repo skills/)')
    .option('--fix', 'fix literal \\n corruption under skills/ before validating')
    .option('--strict', 'exit 1 on warnings')
    .action((skillsDir: string | undefined, opts: { fix?: boolean; strict?: boolean }) => {
      const root = repoRootFromCliSrc()
      const resolved = resolve(skillsDir ?? join(root, 'skills'))
      if (opts.fix) {
        const fixed = fixMarkdownTree(resolved)
        for (const f of fixed) console.log(chalk.dim(`fixed: ${f}`))
        if (fixed.length) console.log(chalk.green(`Repaired ${fixed.length} file(s)`))
      }
      const { ok, results } = validateAllSkills(resolved)
      let hasWarnings = false
      for (const { name, result } of results) {
        if (result.ok && result.warnings.length === 0) {
          console.log(chalk.green(`✓ ${name}`))
          continue
        }
        if (result.ok) {
          console.log(chalk.yellow(`✓ ${name} (${result.warnings.length} warning(s))`))
          hasWarnings = true
          for (const w of result.warnings) console.log(chalk.dim(`    warn: ${w}`))
          continue
        }
        console.log(chalk.red(`✗ ${name}`))
        for (const e of result.errors) console.log(chalk.red(`    error: ${e}`))
        for (const w of result.warnings) console.log(chalk.dim(`    warn: ${w}`))
      }
      if (!ok) {
        console.log(chalk.red(`\n${results.filter((r) => !r.result.ok).length} skill(s) failed`))
        process.exit(1)
      }
      if (opts.strict && hasWarnings) {
        console.log(chalk.red('\nWarnings treated as errors (--strict)'))
        process.exit(1)
      }
      console.log(chalk.green(`\nAll ${results.length} skill(s) passed`))
    })

  program
    .command('install <name>')
    .description('Install a skill from the hub')
    .action(async (nameRaw: string) => {
      const [name, version] = nameRaw.split('@')
      const spinner = ora(`Installing ${name}...`).start()
      try {
        const url = version ? `/skill/install/${name}?version=${version}` : `/skill/install/${name}`
        const skill = await api.get<any>(url)
        writeSkillFiles(skill)
        spinner.succeed(chalk.green(`Installed ${skill.name}@${skill.version} → ${skill.install_path}`))
      } catch (err: any) {
        spinner.fail(err.message)
        process.exit(1)
      }
    })

  program
    .command('publish <dir>')
    .description('Publish a skill directory to the hub')
    .option('--version <v>', 'version', '1.0.0')
    .option('--compatible <tools>', 'comma-separated AI tools')
    .option('--tags <tags>', 'comma-separated tags')
    .option('--changelog <msg>', 'changelog message')
    .option('--skip-validate', 'publish without running skill validate')
    .action(async (dir: string, opts: any) => {
      const resolved = resolve(dir)
      if (!opts.skipValidate) {
        const validation = validateSkillDir(resolved)
        if (!validation.ok) {
          for (const e of validation.errors) console.error(chalk.red(`error: ${e}`))
          console.error(chalk.red('Publish aborted — fix errors or use --skip-validate'))
          process.exit(1)
        }
      }
      const spinner = ora('Publishing...').start()
      try {
        const skill = readSkillDir(resolved)
        if (opts.version) skill.version = opts.version
        if (opts.compatible) skill.compatible = opts.compatible.split(',').map((s: string) => s.trim())
        if (opts.tags) skill.tags = opts.tags.split(',').map((s: string) => s.trim())
        const data = await api.post<any>('/skill/publish', { ...skill, changelog: opts.changelog ?? '' })
        spinner.succeed(chalk.green(`Published ${data.name}@${data.version}`))
      } catch (err: any) {
        spinner.fail(err.message)
        process.exit(1)
      }
    })

  program
    .command('update [name]')
    .description('Update installed skill(s)')
    .option('--all', 'update all installed skills')
    .action(async (name: string | undefined, opts: { all?: boolean }) => {
      const config = getConfig()
      const baseDir = resolve(config.skills_dir.replace('~', process.env.HOME ?? ''))

      const names: string[] = opts.all
        ? readdirSync(baseDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
        : name ? [name] : []

      if (names.length === 0) {
        console.log(chalk.yellow('Specify a skill name or use --all'))
        return
      }

      for (const n of names) {
        const spinner = ora(`Updating ${n}...`).start()
        try {
          const skill = await api.get<any>(`/skill/install/${n}`)
          writeSkillFiles(skill)
          spinner.succeed(chalk.green(`Updated ${n}@${skill.version}`))
        } catch (err: any) {
          spinner.fail(`${n}: ${err.message}`)
        }
      }
    })

  program
    .command('list')
    .description('List installed skills')
    .action(async () => {
      const spinner = ora('Fetching skills...').start()
      try {
        const data = await api.get<any[]>('/skill/list')
        spinner.stop()
        for (const s of data) {
          console.log(chalk.bold(s.name) + chalk.dim(` v${s.latest_version}`))
          console.log(chalk.gray(`  ${s.description}`))
          if (s.compatible?.length) console.log(chalk.dim(`  Compatible: ${s.compatible.join(', ')}`))
          console.log()
        }
      } catch (err: any) {
        spinner.fail(err.message)
        process.exit(1)
      }
    })

  program
    .command('info <name>')
    .description('Show skill details')
    .action(async (name: string) => {
      const spinner = ora('Fetching...').start()
      try {
        const data = await api.get<any>(`/skill/${name}`)
        spinner.stop()
        console.log(chalk.bold.cyan(data.name) + chalk.dim(` (latest: ${data.latest_version})`))
        console.log(data.description)
        console.log(chalk.dim(`Compatible: ${data.compatible?.join(', ') ?? '—'}`))
        console.log(chalk.dim('\nVersions:'))
        for (const v of data.versions ?? []) {
          console.log(chalk.dim(`  ${v.version} — ${v.changelog || 'no notes'}`))
        }
      } catch (err: any) {
        spinner.fail(err.message)
        process.exit(1)
      }
    })

  program
    .command('compose')
    .description('Compose multiple skills into one')
    .requiredOption('--name <n>', 'name for the composed skill')
    .option('--use <skill>', 'skill to include (repeatable)', (v, acc: string[]) => { acc.push(v); return acc }, [] as string[])
    .option('--kb', 'inject kb:search and kb:push phases')
    .option('--out <file>', 'write composed SKILL.md to file')
    .action(async (opts: { name: string; use: string[]; kb?: boolean; out?: string }) => {
      const spinner = ora('Composing skills...').start()
      try {
        const data = await api.post<any>('/skill/compose', {
          name: opts.name,
          skills: opts.use,
          kb_integration: !!opts.kb,
        })
        spinner.stop()
        if (opts.out) {
          writeFileSync(opts.out, data.content, 'utf-8')
          console.log(chalk.green(`Written to ${opts.out}`))
        } else {
          console.log(data.content)
        }
        console.log(chalk.dim(`\nMerged: ${data.skills_merged.join(', ')}`))
      } catch (err: any) {
        spinner.fail(err.message)
        process.exit(1)
      }
    })
}
