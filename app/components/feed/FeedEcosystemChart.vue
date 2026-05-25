<script setup lang="ts">
import { ECOSYSTEM_META } from '#shared/constants/ecosystems'
import type { FeedSummary } from '#shared/types/threat'

const props = defineProps<{
  summary: FeedSummary | null
  pending?: boolean
  range?: string
}>()

const rangeLabel = computed(() => {
  const r = props.range ?? '7d'
  if (r === '24h') return '24H'
  if (r === '30d') return '30D'
  return '7D'
})

const showPlaceholder = computed(() => props.pending && !props.summary)

const distribution = computed(() => {
  const s = props.summary
  if (!s) return []

  const rows = ECOSYSTEM_META.map((meta) => {
    const count = s.byEcosystem[meta.id] ?? 0
    return { ...meta, count }
  })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)

  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1
  return rows.map((row) => ({
    ...row,
    pct: Math.round((row.count / total) * 100)
  }))
})
</script>

<template>
  <section
    class="tp-panel rounded-sm p-4"
    data-testid="feed-ecosystem-distribution"
  >
    <h2 class="tp-label">ECOSYSTEM_DISTRIBUTION_{{ rangeLabel }}</h2>
    <div
      v-if="showPlaceholder"
      class="mt-4 space-y-4"
      data-testid="feed-ecosystem-distribution-loading"
    >
      <div v-for="n in 4" :key="n" class="animate-pulse">
        <div class="mb-1 flex justify-between">
          <span class="h-3 w-12 rounded-sm bg-[var(--tp-surface-inset)]" />
          <span class="h-3 w-8 rounded-sm bg-[var(--tp-surface-inset)]" />
        </div>
        <div class="h-1.5 rounded-sm bg-[var(--tp-surface-inset)]" />
      </div>
    </div>
    <div
      v-else-if="distribution.length === 0"
      class="mt-4 font-tp-mono text-[10px] text-[var(--tp-text-dim)]"
    >
      No incidents in range
    </div>
    <div v-else class="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
      <div v-for="row in distribution" :key="row.id">
        <div class="mb-1 flex justify-between font-tp-mono text-[10px]">
          <span :class="row.cssClass">{{ row.label }}</span>
          <span class="tabular-nums text-[var(--tp-text-dim)]">
            {{ row.count }} · {{ row.pct }}%
          </span>
        </div>
        <div
          class="h-1.5 overflow-hidden rounded-sm bg-[var(--tp-surface-inset)]"
        >
          <div
            class="h-full min-w-0.5 rounded-sm transition-all duration-500"
            :style="{
              width: `${Math.max(row.pct, row.count > 0 ? 2 : 0)}%`,
              backgroundColor: `var(${row.colorVar})`
            }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
