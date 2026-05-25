import {
  getEcosystemMeta,
  type Ecosystem
} from '#shared/constants/ecosystems'

export function ecosystemCssClass(eco: Ecosystem | string): string {
  return getEcosystemMeta(eco)?.cssClass ?? 'tp-eco-npm'
}
