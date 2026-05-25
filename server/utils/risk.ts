import type { Severity } from '#shared/types/threat'
import { severityFromScore } from '#shared/types/threat'

export interface RiskSignals {
  postinstallScript?: boolean
  obfuscatedCode?: boolean
  credentialExfiltration?: boolean
  typosquatting?: boolean
  newMaintainer?: boolean
  massPublishing?: boolean
  cryptoWalletTargeting?: boolean
}

export function computeRiskScore(signals: RiskSignals): number {
  let score = 0
  if (signals.postinstallScript) score += 20
  if (signals.obfuscatedCode) score += 40
  if (signals.credentialExfiltration) score += 80
  if (signals.typosquatting) score += 35
  if (signals.newMaintainer) score += 15
  if (signals.massPublishing) score += 20
  if (signals.cryptoWalletTargeting) score += 60
  return Math.min(100, score)
}

export function scoreToSeverity(score: number): Severity {
  return severityFromScore(score)
}
