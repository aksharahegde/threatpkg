import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ChangelogRelease } from '#shared/types/changelog'

const RELEASE_HEADING_RE = /^## \[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})\s*$/gm
const UNRELEASED_HEADING_RE = /^## \[Unreleased\]\s*$/m

export function parseChangelogMarkdown(source: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = []
  const matches = [...source.matchAll(RELEASE_HEADING_RE)]

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!
    const version = match[1]!.trim()
    const date = match[2]!.trim()
    const bodyStart = match.index! + match[0].length
    const bodyEnd = matches[i + 1]?.index ?? source.length
    const body = source.slice(bodyStart, bodyEnd).trim()

    releases.push({ version, date, body })
  }

  return releases.sort((a, b) => {
    if (!a.date || !b.date) return 0
    return b.date.localeCompare(a.date)
  })
}

export function parseUnreleasedSection(source: string): string | null {
  const unreleasedMatch = source.match(UNRELEASED_HEADING_RE)
  if (!unreleasedMatch || unreleasedMatch.index === undefined) return null

  const bodyStart = unreleasedMatch.index + unreleasedMatch[0].length
  const nextHeading = source.slice(bodyStart).search(/^## \[/m)
  const bodyEnd = nextHeading === -1 ? source.length : bodyStart + nextHeading
  const body = source.slice(bodyStart, bodyEnd).trim()

  return body.length > 0 ? body : null
}

export async function readChangelogReleases(rootDir: string): Promise<ChangelogRelease[]> {
  try {
    const filePath = join(rootDir, 'CHANGELOG.md')
    const source = await readFile(filePath, 'utf8')
    const releases = parseChangelogMarkdown(source)
    const unreleasedBody = parseUnreleasedSection(source)

    if (unreleasedBody) {
      releases.unshift({
        version: 'Unreleased',
        date: null,
        body: unreleasedBody
      })
    }

    return releases
  } catch {
    return []
  }
}
