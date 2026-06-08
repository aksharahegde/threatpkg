<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'

defineProps<{
  incidents: FeedIncident[]
  signals: string[]
}>()

function badgeColor(severity: string) {
  if (severity === 'critical') return 'error'
  if (severity === 'high') return 'warning'
  if (severity === 'medium') return 'info'
  return 'neutral'
}

function riskScoreClass(severity: string) {
  if (severity === 'critical') return 'text-[var(--feed-rail-critical)]'
  if (severity === 'high') return 'text-[var(--feed-rail-high)]'
  if (severity === 'medium') return 'text-[var(--feed-rail-medium)]'
  return 'text-[var(--tp-text-muted)]'
}
</script>

<template>
  <section class="px-4 py-5 sm:px-6" data-testid="package-incident-history">
    <div
      class="tp-panel rounded-sm px-4 py-4"
      data-testid="package-suspicious-signals"
    >
      <h2 class="tp-label">Suspicious signals</h2>
      <ul
        v-if="signals.length"
        class="mt-3 space-y-1.5 font-mono text-xs text-amber-400"
        role="list"
      >
        <li v-for="(s, i) in signals" :key="i">{{ s }}</li>
      </ul>
      <p v-else class="mt-3 text-sm text-[var(--tp-text-muted)]">No signals detected.</p>
    </div>

    <div class="mt-5">
      <h2 class="tp-label">Incident history</h2>
      <ul v-if="incidents.length" class="mt-3 space-y-2" role="list">
        <li
          v-for="inc in incidents"
          :key="inc.id"
          class="tp-panel rounded-sm px-4 py-3"
          :data-testid="`package-incident-row-${inc.id}`"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <NuxtLink
                :to="`/incident/${inc.id}`"
                class="text-sm font-medium text-[var(--tp-accent)] hover:opacity-80"
              >
                {{ inc.title }}
              </NuxtLink>
              <p class="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[var(--tp-text-dim)]">
                <UBadge
                  :label="inc.severity"
                  size="xs"
                  variant="subtle"
                  :color="badgeColor(inc.severity)"
                />
                <span
                  class="font-mono tabular-nums"
                  :class="riskScoreClass(inc.severity)"
                >risk {{ inc.riskScore }}</span>
                <span class="text-[var(--tp-border-strong)]">·</span>
                <span class="uppercase">{{ inc.source }}</span>
              </p>
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="mt-0.5 size-4 shrink-0 text-[var(--tp-text-dim)]"
            />
          </div>
        </li>
      </ul>
      <p
        v-else
        class="mt-3 rounded-sm border border-dashed border-[var(--tp-border)] px-4 py-6 text-center text-sm text-[var(--tp-text-dim)]"
      >
        No indexed incidents for this package.
      </p>
    </div>
  </section>
</template>
