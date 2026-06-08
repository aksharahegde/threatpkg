const SOURCE_BOILERPLATE_RE =
  /^---\s*\n_-= Per source details\. Do not edit below this line\.=-_\s*\n*/i

const SOURCE_HEADER_RE =
  /^##\s+Source:\s*(.+?)\s*\(([a-f0-9]{32,})\)\s*$/gim

const BOGUS_VERSION_RE = /\[native code\]|function\s+fixed/i

export interface IncidentSourceDigest {
  label: string
  digest: string
}

export function extractIncidentSourceDigests(description: string): {
  body: string
  sources: IncidentSourceDigest[]
} {
  const sources: IncidentSourceDigest[] = []
  let body = description.replace(SOURCE_BOILERPLATE_RE, '')

  body = body.replace(SOURCE_HEADER_RE, (_match, label: string, digest: string) => {
    sources.push({ label: label.trim(), digest: digest.trim() })
    return ''
  })

  body = body.replace(/\n{3,}/g, '\n\n').trim()
  return { body, sources }
}

export function isDisplayableAffectedVersion(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '*') return false
  if (BOGUS_VERSION_RE.test(trimmed)) return false
  if (/^(CVE-|GHSA-|MAL-)/i.test(trimmed)) return false
  return true
}

export function shouldCollapseIndicatorValue(
  value: string,
  indicatorType?: string
): boolean {
  if (indicatorType === 'alias' || indicatorType === 'ghsa') return true
  const trimmed = value.trim()
  return trimmed.length > 48 || /^[a-f0-9]{32,}$/i.test(trimmed)
}
