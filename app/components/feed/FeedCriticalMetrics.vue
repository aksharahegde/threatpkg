<script setup lang="ts">
import type { FeedSummary } from '#shared/types/threat'

const props = defineProps<{
  summary: FeedSummary | null
  pending?: boolean
  range?: string
}>()

const showPlaceholder = computed(() => props.pending && !props.summary)

const threatsLabel = computed(() => {
  const r = props.range ?? '7d'
  if (r === '24h') return 'THREATS_24H'
  if (r === '30d') return 'THREATS_30D'
  return 'THREATS_7D'
})
</script>

<template>
  <section class="tp-panel rounded-sm p-4" data-testid="feed-stats">
    <h2 class="tp-label">CRITICAL_METRICS</h2>
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div data-testid="feed-stat-incidents">
        <p
          class="font-tp-mono text-3xl font-semibold tabular-nums text-[var(--tp-text-muted)]"
        >
          {{ showPlaceholder ? '—' : String(summary?.total ?? 0) }}
        </p>
        <p class="tp-label mt-1">{{ threatsLabel }}</p>
      </div>
      <div data-testid="feed-stat-critical">
        <p
          class="font-tp-mono text-3xl font-semibold tabular-nums text-[var(--feed-rail-critical)]"
        >
          {{
            showPlaceholder
              ? '—'
              : String(summary?.critical ?? 0).padStart(2, '0')
          }}
        </p>
        <p class="tp-label mt-1 text-[var(--feed-rail-critical)]">CRITICAL</p>
      </div>
    </div>
  </section>
</template>
