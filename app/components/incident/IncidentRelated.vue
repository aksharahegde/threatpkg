<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'

defineProps<{
  incidents: FeedIncident[]
}>()

function railColor(severity: string) {
  const map: Record<string, string> = {
    critical: 'var(--feed-rail-critical)',
    high: 'var(--feed-rail-high)',
    medium: 'var(--feed-rail-medium)',
    low: 'var(--feed-rail-low)'
  }
  return map[severity] ?? map.low
}
</script>

<template>
  <section
    class="border-t border-[var(--tp-border)] px-4 py-5 sm:px-6"
    data-testid="incident-related-section"
  >
    <h2 class="tp-label">Related incidents</h2>
    <ul class="mt-3 divide-y divide-[var(--tp-border)]" role="list">
      <li
        v-for="rel in incidents"
        :key="rel.id"
        class="group flex min-h-[2.75rem] items-center transition-colors hover:bg-[var(--tp-surface-inset)]"
        :style="{
          borderLeftWidth: '3px',
          borderLeftStyle: 'solid',
          borderLeftColor: railColor(rel.severity)
        }"
      >
        <NuxtLink
          :to="`/incident/${rel.id}`"
          class="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2.5"
        >
          <span class="min-w-0">
            <span
              class="block truncate text-sm text-[var(--tp-text)] group-hover:text-[var(--tp-accent)]"
            >
              {{ rel.title }}
            </span>
            <span class="mt-0.5 block font-mono text-[11px] text-[var(--tp-text-muted)]">
              {{ rel.packageName }}
            </span>
          </span>
          <span class="shrink-0 font-mono text-sm tabular-nums text-[var(--tp-text-dim)]">
            {{ rel.riskScore }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
