export const ECOSYSTEMS = [
  'npm',
  'pypi',
  'go',
  'crates',
  'maven',
  'nuget',
  'rubygems',
  'packagist',
  'pub'
] as const

export type Ecosystem = (typeof ECOSYSTEMS)[number]

export interface EcosystemMeta {
  id: Ecosystem
  label: string
  osvCsvUrl: string
  osvNames: string[]
  githubNames: string[]
  cssClass: string
  colorVar: string
}

const OSV_BASE = 'https://storage.googleapis.com/osv-vulnerabilities'

export const ECOSYSTEM_META: EcosystemMeta[] = [
  {
    id: 'npm',
    label: 'NPM',
    osvCsvUrl: `${OSV_BASE}/npm/modified_id.csv`,
    osvNames: ['npm'],
    githubNames: ['npm'],
    cssClass: 'tp-eco-npm',
    colorVar: '--tp-npm'
  },
  {
    id: 'pypi',
    label: 'PYPI',
    osvCsvUrl: `${OSV_BASE}/PyPI/modified_id.csv`,
    osvNames: ['pypi', 'python'],
    githubNames: ['pip', 'pypi'],
    cssClass: 'tp-eco-pypi',
    colorVar: '--tp-pypi'
  },
  {
    id: 'go',
    label: 'GO',
    osvCsvUrl: `${OSV_BASE}/Go/modified_id.csv`,
    osvNames: ['go'],
    githubNames: ['go'],
    cssClass: 'tp-eco-go',
    colorVar: '--tp-go'
  },
  {
    id: 'crates',
    label: 'CRATES',
    osvCsvUrl: `${OSV_BASE}/crates.io/modified_id.csv`,
    osvNames: ['crates.io', 'cargo', 'rust'],
    githubNames: ['rust'],
    cssClass: 'tp-eco-crates',
    colorVar: '--tp-crates'
  },
  {
    id: 'maven',
    label: 'MAVEN',
    osvCsvUrl: `${OSV_BASE}/Maven/modified_id.csv`,
    osvNames: ['maven'],
    githubNames: ['maven'],
    cssClass: 'tp-eco-maven',
    colorVar: '--tp-maven'
  },
  {
    id: 'nuget',
    label: 'NUGET',
    osvCsvUrl: `${OSV_BASE}/NuGet/modified_id.csv`,
    osvNames: ['nuget'],
    githubNames: ['nuget'],
    cssClass: 'tp-eco-nuget',
    colorVar: '--tp-nuget'
  },
  {
    id: 'rubygems',
    label: 'RUBYGEMS',
    osvCsvUrl: `${OSV_BASE}/RubyGems/modified_id.csv`,
    osvNames: ['rubygems', 'ruby'],
    githubNames: ['rubygems'],
    cssClass: 'tp-eco-rubygems',
    colorVar: '--tp-rubygems'
  },
  {
    id: 'packagist',
    label: 'LARAVEL',
    osvCsvUrl: `${OSV_BASE}/Packagist/modified_id.csv`,
    osvNames: ['packagist', 'composer'],
    githubNames: ['composer'],
    cssClass: 'tp-eco-packagist',
    colorVar: '--tp-packagist'
  },
  {
    id: 'pub',
    label: 'FLUTTER',
    osvCsvUrl: `${OSV_BASE}/Pub/modified_id.csv`,
    osvNames: ['pub'],
    githubNames: ['pub'],
    cssClass: 'tp-eco-pub',
    colorVar: '--tp-pub'
  }
]

const metaById = new Map(ECOSYSTEM_META.map((m) => [m.id, m]))

const osvNameToEcosystem = new Map<string, Ecosystem>()
const githubNameToEcosystem = new Map<string, Ecosystem>()

for (const meta of ECOSYSTEM_META) {
  for (const name of meta.osvNames) {
    osvNameToEcosystem.set(name.toLowerCase(), meta.id)
  }
  for (const name of meta.githubNames) {
    githubNameToEcosystem.set(name.toLowerCase(), meta.id)
  }
}

export function getEcosystemMeta(id: Ecosystem | string): EcosystemMeta | undefined {
  return metaById.get(id as Ecosystem)
}

export function mapOsvEcosystem(raw: string): Ecosystem | null {
  return osvNameToEcosystem.get(raw.trim().toLowerCase()) ?? null
}

export function mapGithubEcosystem(raw: string): Ecosystem | null {
  return githubNameToEcosystem.get(raw.trim().toLowerCase()) ?? null
}

/** RSS / free-text inference: explicit ecosystem mention wins; npm only if npm mentioned. */
export function inferEcosystemFromText(text: string): Ecosystem | null {
  const lower = text.toLowerCase()

  const rules: { eco: Ecosystem; patterns: RegExp[] }[] = [
    {
      eco: 'packagist',
      patterns: [
        /\blaravel\b/,
        /\bpackagist\b/,
        /\bcomposer\b/,
        /\bphp package\b/
      ]
    },
    {
      eco: 'pub',
      patterns: [/\bflutter\b/, /\bpub\.dev\b/, /\bdart package\b/, /\bpubspec\b/]
    },
    { eco: 'pypi', patterns: [/\bpypi\b/, /\bpython package\b/, /\bpip install\b/] },
    { eco: 'crates', patterns: [/\bcrates\.io\b/, /\bcargo\b/, /\brust crate\b/] },
    { eco: 'go', patterns: [/\bgo module\b/, /\bgolang\b/, /\bpkg\.go\.dev\b/] },
    { eco: 'maven', patterns: [/\bmaven\b/, /\bjava package\b/] },
    { eco: 'nuget', patterns: [/\bnuget\b/, /\.net package\b/] },
    { eco: 'rubygems', patterns: [/\brubygems\b/, /\bruby gem\b/] },
    { eco: 'npm', patterns: [/\bnpm\b/, /\bnode package\b/] }
  ]

  for (const { eco, patterns } of rules) {
    if (patterns.some((p) => p.test(lower))) return eco
  }

  return null
}

export function remediationCommands(
  ecosystem: Ecosystem,
  packageName: string
): string[] {
  switch (ecosystem) {
    case 'pypi':
      return [
        `$ pip uninstall ${packageName}`,
        `$ pip install ${packageName}  # pin safe version`
      ]
    case 'go':
      return [
        `# remove from go.mod / go.sum and re-resolve`,
        `$ go get ${packageName}@safe-version`
      ]
    case 'crates':
      return [
        `# remove from Cargo.toml / Cargo.lock`,
        `$ cargo update -p ${packageName}`
      ]
    case 'maven':
      return [
        `# exclude or override in pom.xml / build.gradle`,
        `# pin a safe version of ${packageName}`
      ]
    case 'nuget':
      return [
        `$ dotnet remove package ${packageName}`,
        `$ dotnet add package ${packageName} --version <safe>`
      ]
    case 'rubygems':
      return [
        `$ gem uninstall ${packageName}`,
        `# pin safe version in Gemfile`
      ]
    case 'packagist':
      return [
        `$ composer remove ${packageName}`,
        `# audit composer.lock and pin a safe version`
      ]
    case 'pub':
      return [
        `$ flutter pub remove ${packageName}`,
        `$ dart pub remove ${packageName}  # non-Flutter Dart apps`
      ]
    case 'npm':
    default:
      return [
        `$ npm uninstall ${packageName}`,
        `$ npm install ${packageName}@latest  # pin safe version`
      ]
  }
}
