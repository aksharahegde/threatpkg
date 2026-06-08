import type {
  DependencyFileInput,
  ParseResult,
  ResolvedDependency,
  ScanEcosystem
} from '../types/scan'

const EXACT_VERSION_RE = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/
const RANGE_PREFIX_RE = /^[~^><=]/

function depKey(eco: ScanEcosystem, name: string, version: string) {
  return `${eco}:${name.toLowerCase()}@${version}`
}

function isExactVersion(version: string): boolean {
  if (!version || RANGE_PREFIX_RE.test(version)) return false
  if (version === 'latest' || version === '*') return false
  return EXACT_VERSION_RE.test(version) || /^\d+(\.\d+)*([a-zA-Z0-9.-]*)?$/.test(version)
}

function normalizePackageName(name: string): string {
  return name.trim()
}

export function parsePackageLock(content: string): ParseResult {
  const warnings: string[] = []
  const dependencies: ResolvedDependency[] = []

  let data: unknown
  try {
    data = JSON.parse(content)
  } catch {
    return { dependencies: [], warnings: ['package-lock.json: invalid JSON'] }
  }

  if (!data || typeof data !== 'object') {
    return { dependencies: [], warnings: ['package-lock.json: expected object root'] }
  }

  const root = data as Record<string, unknown>
  const packages = root.packages as Record<string, { name?: string; version?: string }> | undefined

  if (packages && typeof packages === 'object') {
    for (const [path, pkg] of Object.entries(packages)) {
      if (!pkg?.version) continue
      const name =
        pkg.name ??
        (path === '' ? (root.name as string | undefined) : path.replace(/^node_modules\//, ''))
      if (!name) continue
      dependencies.push({
        packageName: normalizePackageName(name),
        version: pkg.version,
        ecosystem: 'npm'
      })
    }
    return { dependencies, warnings }
  }

  const lockDeps = root.dependencies as Record<
    string,
    { version?: string; dependencies?: Record<string, unknown> }
  > | undefined

  if (lockDeps && typeof lockDeps === 'object') {
    type LockDep = { version?: string; dependencies?: Record<string, LockDep> }
    function walk(deps: Record<string, LockDep>) {
      for (const [name, entry] of Object.entries(deps)) {
        if (entry?.version) {
          dependencies.push({
            packageName: normalizePackageName(name),
            version: entry.version.replace(/^[^0-9]*/, ''),
            ecosystem: 'npm'
          })
        }
        if (entry?.dependencies) walk(entry.dependencies)
      }
    }
    walk(lockDeps as Record<string, LockDep>)
  }

  if (!dependencies.length) {
    warnings.push('package-lock.json: no packages found')
  }

  return { dependencies, warnings }
}

export function parsePackageJson(content: string): ParseResult {
  const warnings: string[] = []
  const dependencies: ResolvedDependency[] = []

  let data: unknown
  try {
    data = JSON.parse(content)
  } catch {
    return { dependencies: [], warnings: ['package.json: invalid JSON'] }
  }

  if (!data || typeof data !== 'object') {
    return { dependencies: [], warnings: ['package.json: expected object root'] }
  }

  const root = data as Record<string, unknown>
  const sections = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'] as const

  for (const section of sections) {
    const deps = root[section] as Record<string, string> | undefined
    if (!deps || typeof deps !== 'object') continue

    for (const [name, version] of Object.entries(deps)) {
      if (!version || typeof version !== 'string') continue
      if (isExactVersion(version)) {
        dependencies.push({
          packageName: normalizePackageName(name),
          version,
          ecosystem: 'npm'
        })
      } else {
        warnings.push(
          `package.json: skipped ${name}@${version} (range — use a lockfile for exact version)`
        )
      }
    }
  }

  return { dependencies, warnings }
}

function parseNameAtVersion(ref: string): { name: string; version: string } | null {
  const at = ref.lastIndexOf('@')
  if (at <= 0) return null
  const name = ref.slice(0, at)
  const version = ref.slice(at + 1)
  if (!name || !version) return null
  return { name, version }
}

export function parseBunLock(content: string): ParseResult {
  const warnings: string[] = []
  const dependencies: ResolvedDependency[] = []

  let data: unknown
  try {
    data = JSON.parse(content)
  } catch {
    return { dependencies: [], warnings: ['bun.lock: invalid JSON'] }
  }

  if (!data || typeof data !== 'object') {
    return { dependencies: [], warnings: ['bun.lock: expected object root'] }
  }

  const packages = (data as Record<string, unknown>).packages
  if (!packages || typeof packages !== 'object') {
    return { dependencies: [], warnings: ['bun.lock: no packages object found'] }
  }

  const seen = new Set<string>()

  for (const [key, value] of Object.entries(packages as Record<string, unknown>)) {
    if (!Array.isArray(value) || !value[0] || typeof value[0] !== 'string') continue

    const parsed = parseNameAtVersion(value[0])
    const name = parsed?.name ?? key
    const version = parsed?.version
    if (!version) continue

    const dedupeKey = `${name}@${version}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    dependencies.push({
      packageName: normalizePackageName(name),
      version,
      ecosystem: 'npm'
    })
  }

  if (!dependencies.length) {
    warnings.push('bun.lock: no packages found')
  }

  return { dependencies, warnings }
}

function yarnHeaderPackageName(header: string): string | null {
  const trimmed = header.replace(/^["']|["']$/g, '').replace(/:$/, '').trim()
  if (!trimmed) return null

  if (trimmed.startsWith('@')) {
    const slash = trimmed.indexOf('/')
    if (slash === -1) return null
    const afterScope = trimmed.slice(slash + 1)
    const at = afterScope.indexOf('@')
    return at === -1 ? trimmed : trimmed.slice(0, slash + 1 + at)
  }

  const at = trimmed.indexOf('@')
  return at === -1 ? trimmed : trimmed.slice(0, at)
}

export function parseYarnLock(content: string): ParseResult {
  const warnings: string[] = []
  const dependencies: ResolvedDependency[] = []
  const seen = new Set<string>()

  let currentHeader: string | null = null

  for (const rawLine of content.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (!line.trim() || line.trimStart().startsWith('#')) continue

    if (!/^\s/.test(line) && line.trimEnd().endsWith(':')) {
      currentHeader = line.trimEnd().slice(0, -1)
      continue
    }

    if (!currentHeader) continue

    const versionMatch =
      line.match(/^\s+version\s+"([^"]+)"/) ??
      line.match(/^\s+version:\s+["']?([^"'\s]+)["']?/)

    if (!versionMatch?.[1]) continue

    const packageName = yarnHeaderPackageName(currentHeader)
    if (!packageName) continue

    const version = versionMatch[1]
    const dedupeKey = `${packageName.toLowerCase()}@${version}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    dependencies.push({
      packageName: normalizePackageName(packageName),
      version,
      ecosystem: 'npm'
    })
  }

  if (!dependencies.length) {
    warnings.push('yarn.lock: no packages found')
  }

  return { dependencies, warnings }
}

function pnpmPackageFromKeyLine(line: string): { name: string; version: string } | null {
  const match = line.match(/^  (['"]?)(\/?[^'"\n]+)\1:\s*$/)
  if (!match?.[2]?.includes('@')) return null

  const key = match[2].replace(/\(.*\)$/, '')
  const withoutSlash = key.startsWith('/') ? key.slice(1) : key
  const at = withoutSlash.lastIndexOf('@')
  if (at <= 0) return null

  const name = withoutSlash.slice(0, at)
  const version = withoutSlash.slice(at + 1)
  if (!name || !version) return null

  return { name, version }
}

export function parsePnpmLock(content: string): ParseResult {
  const warnings: string[] = []
  const dependencies: ResolvedDependency[] = []
  const seen = new Set<string>()

  let inPackages = false

  for (const rawLine of content.split('\n')) {
    const line = rawLine.replace(/\r$/, '')

    if (/^packages:\s*$/.test(line)) {
      inPackages = true
      continue
    }

    if (inPackages && /^[^\s#]/.test(line)) {
      inPackages = false
    }

    if (!inPackages) continue

    const parsed = pnpmPackageFromKeyLine(line)
    if (!parsed) continue

    const dedupeKey = `${parsed.name.toLowerCase()}@${parsed.version}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    dependencies.push({
      packageName: normalizePackageName(parsed.name),
      version: parsed.version,
      ecosystem: 'npm'
    })
  }

  if (!dependencies.length) {
    warnings.push('pnpm-lock.yaml: no packages found')
  }

  return { dependencies, warnings }
}

export function parsePoetryLock(content: string): ParseResult {
  const warnings: string[] = []
  const dependencies: ResolvedDependency[] = []

  const blocks = content.split(/\[\[package\]\]/).slice(1)
  if (!blocks.length) {
    return { dependencies: [], warnings: ['poetry.lock: no [[package]] blocks found'] }
  }

  for (const block of blocks) {
    const nameMatch = block.match(/^name\s*=\s*"([^"]+)"/m)
    const versionMatch = block.match(/^version\s*=\s*"([^"]+)"/m)
    if (nameMatch?.[1] && versionMatch?.[1]) {
      dependencies.push({
        packageName: normalizePackageName(nameMatch[1]),
        version: versionMatch[1],
        ecosystem: 'pypi'
      })
    }
  }

  return { dependencies, warnings }
}

export function parseRequirementsTxt(content: string): ParseResult {
  const warnings: string[] = []
  const dependencies: ResolvedDependency[] = []

  for (const rawLine of content.split('\n')) {
    const line = rawLine.split('#')[0]?.trim() ?? ''
    if (!line) continue
    if (line.startsWith('-')) {
      warnings.push(`requirements.txt: skipped directive "${line}"`)
      continue
    }

    const pinMatch = line.match(/^([a-zA-Z0-9][\w.-]*)\s*={2,3}\s*([^\s;]+)/)
    if (pinMatch?.[1] && pinMatch[2]) {
      dependencies.push({
        packageName: normalizePackageName(pinMatch[1]),
        version: pinMatch[2],
        ecosystem: 'pypi'
      })
      continue
    }

    const nameOnly = line.match(/^([a-zA-Z0-9][\w.-]*)\s*$/)
    if (nameOnly?.[1]) {
      warnings.push(
        `requirements.txt: skipped unpinned ${nameOnly[1]} (use == pin or poetry.lock)`
      )
      continue
    }

    warnings.push(`requirements.txt: skipped unrecognized line "${line}"`)
  }

  return { dependencies, warnings }
}

type FileKind =
  | 'package-lock'
  | 'yarn-lock'
  | 'bun-lock'
  | 'pnpm-lock'
  | 'package-json'
  | 'poetry-lock'
  | 'requirements'
  | 'unknown'

function detectFileKind(filename: string): FileKind {
  const lower = filename.toLowerCase()
  if (lower === 'package-lock.json' || lower.endsWith('/package-lock.json')) return 'package-lock'
  if (lower === 'yarn.lock' || lower.endsWith('/yarn.lock')) return 'yarn-lock'
  if (lower === 'bun.lock' || lower.endsWith('/bun.lock')) return 'bun-lock'
  if (
    lower === 'pnpm-lock.yaml' ||
    lower.endsWith('/pnpm-lock.yaml') ||
    lower === 'pnpm.lock' ||
    lower.endsWith('/pnpm.lock')
  ) {
    return 'pnpm-lock'
  }
  if (lower === 'package.json' || lower.endsWith('/package.json')) return 'package-json'
  if (lower === 'poetry.lock' || lower.endsWith('/poetry.lock')) return 'poetry-lock'
  if (lower === 'requirements.txt' || lower.endsWith('/requirements.txt')) return 'requirements'
  return 'unknown'
}

function parseFile(file: DependencyFileInput): ParseResult {
  const kind = detectFileKind(file.filename)
  switch (kind) {
    case 'package-lock':
      return parsePackageLock(file.content)
    case 'yarn-lock':
      return parseYarnLock(file.content)
    case 'bun-lock':
      return parseBunLock(file.content)
    case 'pnpm-lock':
      return parsePnpmLock(file.content)
    case 'package-json':
      return parsePackageJson(file.content)
    case 'poetry-lock':
      return parsePoetryLock(file.content)
    case 'requirements':
      return parseRequirementsTxt(file.content)
    default:
      return {
        dependencies: [],
        warnings: [
          `Unknown file type: ${file.filename} (expected package-lock.json, yarn.lock, bun.lock, pnpm-lock.yaml, package.json, poetry.lock, or requirements.txt)`
        ]
      }
  }
}

const LOCK_PRIORITY: Record<FileKind, number> = {
  'package-lock': 3,
  'yarn-lock': 3,
  'bun-lock': 3,
  'pnpm-lock': 3,
  'poetry-lock': 3,
  'package-json': 1,
  requirements: 1,
  unknown: 0
}

export function mergeDependencySets(files: DependencyFileInput[]): ParseResult {
  const warnings: string[] = []
  const tagged: { dep: ResolvedDependency; priority: number }[] = []

  for (const file of files) {
    const kind = detectFileKind(file.filename)
    const priority = LOCK_PRIORITY[kind]
    const result = parseFile(file)
    warnings.push(...result.warnings)

    for (const dep of result.dependencies) {
      tagged.push({ dep, priority })
    }
  }

  const maxPriorityByName = new Map<string, number>()
  for (const item of tagged) {
    const nameKey = `${item.dep.ecosystem}:${item.dep.packageName.toLowerCase()}`
    const current = maxPriorityByName.get(nameKey) ?? 0
    if (item.priority > current) maxPriorityByName.set(nameKey, item.priority)
  }

  const byVersionKey = new Map<string, ResolvedDependency>()
  for (const item of tagged) {
    const nameKey = `${item.dep.ecosystem}:${item.dep.packageName.toLowerCase()}`
    const maxPriority = maxPriorityByName.get(nameKey) ?? 0
    if (item.priority < maxPriority) continue

    const versionKey = depKey(item.dep.ecosystem, item.dep.packageName, item.dep.version)
    byVersionKey.set(versionKey, item.dep)
  }

  const dependencies = [...byVersionKey.values()].sort((a, b) =>
    a.packageName.localeCompare(b.packageName)
  )

  return { dependencies, warnings }
}
