import { describe, expect, it } from 'vitest'
import { computeRiskScore, scoreToSeverity } from './risk'

describe('computeRiskScore', () => {
  it('sums signal weights and caps at 100', () => {
    expect(computeRiskScore({})).toBe(0)
    expect(computeRiskScore({ postinstallScript: true })).toBe(20)
    expect(
      computeRiskScore({
        credentialExfiltration: true,
        obfuscatedCode: true
      })
    ).toBe(100)
  })
})

describe('scoreToSeverity', () => {
  it('delegates to shared severity bands', () => {
    expect(scoreToSeverity(95)).toBe('critical')
    expect(scoreToSeverity(50)).toBe('medium')
  })
})
