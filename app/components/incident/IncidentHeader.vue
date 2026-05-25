<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'
import { packagePagePath } from '#shared/utils/package-path'

const props = defineProps<{
  incident: FeedIncident
}>()

function formatPublished(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function railColor(severity: string) {
  const map: Record<string, string> = {
    critical: 'var(--feed-rail-critical)',
    high: 'var(--feed-rail-high)',
    medium: 'var(--feed-rail-medium)',
    low: 'var(--feed-rail-low)'
  }
  return map[severity] ?? map.low
}

function badgeColor(severity: string) {
  if (severity === 'critical') return 'error'
  if (severity === 'high') return 'warning'
  if (severity === 'medium') return 'info'
  return 'neutral'
}

function riskScoreClass(severity: string) {
  if (severity === 'critical') return 'text-[var(--feed-rail-critical)]'
  if (severity === 'high') return 'text-[var(--feed-rail-high)]'
  return 'text-[var(--tp-text)]'
}
</script>

<template>
  <section
    class="relative border-b border-[var(--tp-border)] bg-[var(--tp-surface-raised)]"
    data-testid="incident-detail-header"
    :style="{
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: railColor(incident.severity)
    }"
  >
    <div class="px-4 py-5 sm:px-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              :label="incident.severity"
              size="sm"
              variant="subtle"
              :color="badgeColor(incident.severity)"
            />
            <span class="tp-label">{{ incident.ecosystem }}</span>
            <span class="text-[var(--tp-border-strong)]">·</span>
            <span class="text-[10px] text-[var(--tp-text-dim)]">
              {{ incident.threatType.replace(/_/g, ' ') }}
            </span>
            <span class="text-[var(--tp-border-strong)]">·</span>
            <span class="text-[10px] text-[var(--tp-text-dim)]">{{ incident.source }}</span>
          </div>
          <h1
            class="mt-2 text-xl font-semibold leading-snug text-[var(--tp-text)] sm:text-2xl"
          >
            {{ incident.title }}
          </h1>
          <p class="mt-2 font-mono text-sm">
            <NuxtLink
              :to="packagePagePath(incident.ecosystem, incident.packageName)"
              class="text-[var(--tp-accent)] hover:opacity-80"
            >
              {{ incident.packageName }}
            </NuxtLink>
          </p>
          <time
            :datetime="incident.publishedAt"
            class="mt-2 block text-[11px] text-[var(--tp-text-muted)]"
          >
            Published {{ formatPublished(incident.publishedAt) }}
          </time>
        </div>
        <div
          class="flex shrink-0 flex-col items-end rounded-md border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-3"
        >
          <p class="tp-label">Risk score</p>
          <p
            class="mt-0.5 font-mono text-3xl font-medium tabular-nums"
            :class="riskScoreClass(incident.severity)"
          >
            {{ incident.riskScore }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
