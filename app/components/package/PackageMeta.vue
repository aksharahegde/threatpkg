<script setup lang="ts">
import type { PackageDetail } from '#shared/types/threat'
import { getEcosystemMeta } from '#shared/constants/ecosystems'
import { ecosystemCssClass } from '~/utils/ecosystem'

const props = defineProps<{
  detail: PackageDetail
}>()

const ecoLabel = computed(
  () => getEcosystemMeta(props.detail.reputation.ecosystem)?.label ?? props.detail.reputation.ecosystem
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function riskScoreClass(score: number) {
  if (score >= 80) return 'text-[var(--feed-rail-critical)]'
  if (score >= 60) return 'text-[var(--feed-rail-high)]'
  if (score >= 40) return 'text-[var(--feed-rail-medium)]'
  return 'text-[var(--tp-text)]'
}

function railColor(score: number) {
  if (score >= 80) return 'var(--feed-rail-critical)'
  if (score >= 60) return 'var(--feed-rail-high)'
  if (score >= 40) return 'var(--feed-rail-medium)'
  return 'var(--feed-rail-low)'
}
</script>

<template>
  <section
    class="relative border-b border-[var(--tp-border)] bg-[var(--tp-surface-raised)]"
    data-testid="package-meta-section"
    :style="{
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: railColor(detail.reputation.riskScore)
    }"
  >
    <div class="px-4 py-5 sm:px-6">
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div class="min-w-0 flex-1">
          <span
            class="tp-label uppercase"
            :class="ecosystemCssClass(detail.reputation.ecosystem)"
          >
            {{ ecoLabel }}
          </span>
          <h1 class="mt-2 font-mono text-xl text-[var(--tp-text)] sm:text-2xl">
            {{ detail.reputation.packageName }}
          </h1>

          <dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <div>
              <dt class="tp-label">Maintainers</dt>
              <dd class="mt-1 text-[var(--tp-text-muted)]">
                {{ detail.maintainers.join(', ') || '—' }}
              </dd>
            </div>
            <div>
              <dt class="tp-label">Incidents</dt>
              <dd class="mt-1 font-mono tabular-nums text-[var(--tp-text)]">
                {{ detail.reputation.incidentCount }}
              </dd>
            </div>
            <div>
              <dt class="tp-label">Last updated</dt>
              <dd class="mt-1 text-[var(--tp-text-muted)]">
                {{ formatDate(detail.reputation.lastUpdated) }}
              </dd>
            </div>
          </dl>
        </div>

        <div
          class="flex shrink-0 flex-col rounded-md border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-4"
          data-testid="package-reputation-score"
        >
          <p class="tp-label">Reputation score</p>
          <p
            class="mt-1 font-mono text-4xl font-medium tabular-nums"
            :class="riskScoreClass(detail.reputation.riskScore)"
          >
            {{ detail.reputation.riskScore }}
          </p>
          <p class="mt-1 text-xs text-[var(--tp-text-dim)]">
            Based on {{ detail.reputation.incidentCount }} indexed
            {{ detail.reputation.incidentCount === 1 ? 'incident' : 'incidents' }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
