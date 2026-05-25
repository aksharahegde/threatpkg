import { THREAT_TYPES, type ThreatType } from '#shared/types/threat'

export function topThreatTypeFromCounts(
  byThreatType: Partial<Record<ThreatType, number>>
): { type: ThreatType; count: number } | null {
  let best: { type: ThreatType; count: number } | null = null
  for (const type of THREAT_TYPES) {
    const count = byThreatType[type] ?? 0
    if (!best || count > best.count) {
      best = { type, count }
    }
  }
  return best && best.count > 0 ? best : null
}
