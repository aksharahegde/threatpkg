import type { Severity, ThreatType } from '../../shared/types/threat'
import { severityFromScore } from '../../shared/types/threat'

export function severityToRiskScore(severity: string | undefined): number {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 92
    case 'high':
      return 72
    case 'medium':
      return 52
    case 'low':
      return 32
    default:
      return 45
  }
}

export function inferThreatType(text: string): ThreatType {
  const t = text.toLowerCase()
  if (t.includes('typosquat')) return 'typosquatting'
  if (t.includes('dependency confusion') || t.includes('namespace squat')) {
    return 'dependency_confusion'
  }
  if (t.includes('compromise') || t.includes('account hijack')) {
    return 'maintainer_compromise'
  }
  if (t.includes('credential') || t.includes('exfiltrat')) {
    return 'credential_theft'
  }
  if (t.includes('crypto') || t.includes('miner') || t.includes('wallet')) {
    return 'crypto_miner'
  }
  if (t.includes('obfus')) return 'obfuscation'
  if (t.includes('protest')) return 'protestware'
  return 'malware'
}

export function inferSeverity(
  explicit: string | undefined,
  riskScore: number
): Severity {
  if (explicit && ['critical', 'high', 'medium', 'low'].includes(explicit)) {
    return explicit as Severity
  }
  return severityFromScore(riskScore)
}

export function extractPackageFromTitle(title: string): string | null {
  const patterns = [
    /malware in\s+(@?[\w./-]+)/i,
    /malicious code in\s+(@?[\w./-]+)/i,
    /compromised\s+(@?[\w./-]+)/i,
    /typosquat(?:ting)?\s+(?:of\s+)?(@?[\w./-]+)/i
  ]
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match?.[1]) return match[1].replace(/\s+\(.*\)$/, '').trim()
  }
  return null
}
