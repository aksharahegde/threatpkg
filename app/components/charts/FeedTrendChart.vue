<script setup lang="ts">
import { trendBucketCount } from '#shared/utils/feed-trend'

const props = defineProps<{
  counts: number[]
  range?: string
}>()

const rangeLabel = computed(() => {
  const r = props.range ?? '7d'
  if (r === '24h') return '24H'
  if (r === '30d') return '30D'
  return '7D'
})

const points = computed(() => {
  const buckets =
    props.counts.length > 0
      ? props.counts
      : Array.from({ length: trendBucketCount(props.range) }, () => 0)

  const max = Math.max(...buckets, 1)
  const w = 280
  const h = 72
  const step = w / Math.max(buckets.length - 1, 1)

  const coords = buckets.map((count, i) => {
    const x = i * step
    const y = h - (count / max) * (h - 8) - 4
    return `${x},${y}`
  })

  return {
    path: coords.length ? `M ${coords.join(' L ')}` : '',
    fillPath: coords.length
      ? `M 0,${h} L ${coords.join(' L ')} L ${w},${h} Z`
      : '',
    max,
    total: buckets.reduce((a, b) => a + b, 0)
  }
})
</script>

<template>
  <section class="tp-panel rounded-sm p-4">
    <h2 class="tp-label">TREND_CHART_{{ rangeLabel }}</h2>
    <div
      class="relative mt-3 overflow-hidden rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface-inset)]"
      data-testid="charts-risk-trend"
    >
      <p
        v-if="points.total === 0"
        class="absolute inset-0 flex items-center justify-center font-tp-mono text-[10px] text-[var(--tp-text-dim)]"
      >
        No incidents in range
      </p>
      <svg
        viewBox="0 0 280 72"
        class="h-20 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--tp-accent)" stop-opacity="0.35" />
            <stop offset="100%" stop-color="var(--tp-accent)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <g stroke="var(--tp-grid)" stroke-width="0.5">
          <line x1="0" y1="18" x2="280" y2="18" />
          <line x1="0" y1="36" x2="280" y2="36" />
          <line x1="0" y1="54" x2="280" y2="54" />
        </g>
        <path
          v-if="points.fillPath && points.total > 0"
          :d="points.fillPath"
          fill="url(#trend-fill)"
        />
        <path
          v-if="points.path && points.total > 0"
          :d="points.path"
          fill="none"
          stroke="var(--tp-accent)"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>
  </section>
</template>
