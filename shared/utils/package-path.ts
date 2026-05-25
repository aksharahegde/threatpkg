import type { Ecosystem } from '../types/threat'
import { ECOSYSTEMS } from '../constants/ecosystems'

export function packagePagePath(ecosystem: Ecosystem | string, packageName: string) {
  const eco = (ECOSYSTEMS as readonly string[]).includes(ecosystem)
    ? ecosystem
    : 'npm'
  return `/package/${eco}/${encodeURIComponent(packageName)}`
}
