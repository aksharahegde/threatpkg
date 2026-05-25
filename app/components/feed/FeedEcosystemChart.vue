<script setup lang="ts">
import { ECOSYSTEM_META } from '#shared/constants/ecosystems'
import type { FeedSummary } from '#shared/types/threat'

const props = defineProps<{
  summary: FeedSummary | null
  pending?: boolean
}>()

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
  <section class="tp-panel rounded-sm p-4">
    <h2 class="tp-label">ECOSYSTEM_DISTRIBUTION</h2>
    <div v-if="distribution.length === 0" class="mt-4 text-xs text-[var(--tp-text-dim)]">
      No incidents in range
    </div>
    <div v-else class="mt-4 space-y-4">
      <div v-for="row in distribution" :key="row.id">
        <div class="mb-1 flex justify-between font-tp-mono text-[10px]">
          <span :class="row.cssClass">{{ row.label }}</span>
          <span class="text-[var(--tp-text-dim)]">{{ row.pct }}%</span>
        </div>
        <div
          class="h-1.5 overflow-hidden rounded-sm bg-[var(--tp-surface-inset)]"
        >
          <div
            class="h-full rounded-sm transition-all duration-500"
            :style="{
              width: `${row.pct}%`,
              backgroundColor: `var(${row.colorVar})`
            }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
