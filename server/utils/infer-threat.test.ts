import { describe, expect, it } from 'vitest'
import {
  extractPackageFromTitle,
  inferSeverity,
  inferThreatType,
  severityToRiskScore
} from './infer-threat'

describe('severityToRiskScore', () => {
  it('maps known severities to fixed scores', () => {
    expect(severityToRiskScore('critical')).toBe(92)
    expect(severityToRiskScore('high')).toBe(72)
    expect(severityToRiskScore('medium')).toBe(52)
    expect(severityToRiskScore('low')).toBe(32)
    expect(severityToRiskScore(undefined)).toBe(45)
  })
})

describe('inferThreatType', () => {
  it('classifies supply-chain patterns from text', () => {
    expect(inferThreatType('npm typosquat of lodash')).toBe('typosquatting')
    expect(inferThreatType('dependency confusion in private scope')).toBe(
      'dependency_confusion'
    )
    expect(inferThreatType('maintainer account compromise')).toBe(
      'maintainer_compromise'
    )
    expect(inferThreatType('credential exfiltration in postinstall')).toBe(
      'credential_theft'
    )
    expect(inferThreatType('crypto miner wallet drain')).toBe('crypto_miner')
    expect(inferThreatType('heavily obfuscated payload')).toBe('obfuscation')
    expect(inferThreatType('protest message in install script')).toBe('protestware')
    expect(inferThreatType('generic malicious package')).toBe('malware')
  })
})

describe('inferSeverity', () => {
  it('prefers explicit severity when valid', () => {
    expect(inferSeverity('high', 10)).toBe('high')
  })

  it('derives severity from risk score when explicit is missing', () => {
    expect(inferSeverity(undefined, 92)).toBe('critical')
    expect(inferSeverity('invalid', 30)).toBe('low')
  })
})

describe('extractPackageFromTitle', () => {
  it('extracts package names from common advisory titles', () => {
    expect(extractPackageFromTitle('Malware in lodash.merge.deep')).toBe(
      'lodash.merge.deep'
    )
    expect(extractPackageFromTitle('Malicious code in @scope/pkg')).toBe(
      '@scope/pkg'
    )
    expect(extractPackageFromTitle('Typosquatting of react-icons')).toBe(
      'react-icons'
    )
    expect(extractPackageFromTitle('Unrelated security bulletin')).toBeNull()
  })
})
