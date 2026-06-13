import { describe, expect, it } from 'vitest'
import { parseChangelogMarkdown, parseUnreleasedSection } from './changelog'

const SAMPLE = `# Changelog

All notable changes.

## [Unreleased]

## [0.3.0] - 2025-06-08

### Added
- Dependency manifest scanner

### Changed
- Refreshed package metadata UI

## [0.2.0] - 2025-05-01

### Added
- Initial public release
`

describe('parseChangelogMarkdown', () => {
  it('extracts version, date, and body for each release', () => {
    const releases = parseChangelogMarkdown(SAMPLE)

    expect(releases).toHaveLength(2)
    expect(releases[0]).toEqual({
      version: '0.3.0',
      date: '2025-06-08',
      body: '### Added\n- Dependency manifest scanner\n\n### Changed\n- Refreshed package metadata UI'
    })
    expect(releases[1]).toEqual({
      version: '0.2.0',
      date: '2025-05-01',
      body: '### Added\n- Initial public release'
    })
  })

  it('returns releases newest-first', () => {
    const releases = parseChangelogMarkdown(SAMPLE)
    expect(releases.map((r) => r.version)).toEqual(['0.3.0', '0.2.0'])
  })

  it('returns empty array for content without version headings', () => {
    expect(parseChangelogMarkdown('# Changelog\n\nNothing here.')).toEqual([])
  })
})

describe('parseUnreleasedSection', () => {
  it('returns null when Unreleased section is empty', () => {
    expect(parseUnreleasedSection(SAMPLE)).toBeNull()
  })

  it('returns body when Unreleased section has content', () => {
    const source = `# Changelog

## [Unreleased]

### Added
- Upcoming feature

## [0.3.0] - 2025-06-08

### Added
- Shipped feature
`
    expect(parseUnreleasedSection(source)).toBe('### Added\n- Upcoming feature')
  })
})
