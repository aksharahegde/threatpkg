import type { Ecosystem } from '../types/threat'

export function packagePagePath(ecosystem: Ecosystem | string, packageName: string) {
  const eco = ecosystem.toLowerCase() === 'pypi' ? 'pypi' : 'npm'
  return `/package/${eco}/${encodeURIComponent(packageName)}`
}
