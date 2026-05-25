<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'
import { packagePagePath } from '#shared/utils/package-path'

defineProps<{
  items: FeedIncident[]
}>()

function severityColor(severity: string) {
  if (severity === 'critical') return 'text-[var(--feed-rail-critical)]'
  if (severity === 'high') return 'text-[var(--feed-rail-high)]'
  if (severity === 'medium') return 'text-[var(--feed-rail-medium)]'
  return 'text-[var(--tp-text-dim)]'
}
</script>

<template>
  <section class="tp-panel rounded-sm p-4">
    <h2 class="tp-label">RECENT_DISCLOSURES</h2>
    <ul class="mt-3 space-y-2" role="list">
      <li
        v-for="item in items.slice(0, 6)"
        :key="item.id"
        class="flex items-center justify-between gap-2 border-b border-[var(--tp-border)] pb-2 last:border-0 last:pb-0"
      >
        <NuxtLink
          :to="packagePagePath(item.ecosystem, item.packageName)"
          class="font-tp-mono truncate text-[11px] text-[var(--tp-text-muted)] hover:text-[var(--tp-accent)]"
        >
          /{{ item.ecosystem }}/{{ item.packageName }}
        </NuxtLink>
        <span
          class="shrink-0 font-tp-mono text-[10px] uppercase"
          :class="severityColor(item.severity)"
        >
          {{ item.severity }}
        </span>
      </li>
    </ul>
  </section>
</template>
