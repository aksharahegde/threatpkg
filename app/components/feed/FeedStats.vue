<script setup lang="ts">
import type { Ecosystem, FeedSummary } from '#shared/types/threat'
import { topThreatTypeFromCounts } from '#shared/utils/feed-summary'

const props = defineProps<{
  summary: FeedSummary | null
  pending?: boolean
  range?: string
  ecosystem?: Ecosystem
}>()

function formatThreatLabel(type: string): string {
  return type.replace(/_/g, ' ')
}

const cards = computed(() => {
  const rangeLabel = props.range ?? '7d'
  const showPlaceholder = props.pending && !props.summary
  const s = props.summary

  const base = [
    {
      key: 'incidents',
      label: 'Incidents',
      value: showPlaceholder ? '—' : String(s?.total ?? 0),
      subtitle: `${rangeLabel} window`,
      icon: 'i-lucide-radar',
      iconClass: 'text-cyan-600',
      valueClass: 'text-neutral-900'
    },
    {
      key: 'critical',
      label: 'Critical',
      value: showPlaceholder ? '—' : String(s?.critical ?? 0),
      subtitle: showPlaceholder ? null : `${s?.high ?? 0} high`,
      icon: 'i-lucide-shield-alert',
      iconClass: 'text-red-600',
      valueClass: 'text-red-600'
    },
    {
      key: 'packages',
      label: 'Packages',
      value: showPlaceholder ? '—' : String(s?.uniquePackages ?? 0),
      subtitle: 'distinct names',
      icon: 'i-lucide-package-search',
      iconClass: 'text-amber-600',
      valueClass: 'text-neutral-800'
    }
  ]

  if (props.ecosystem) {
    const top = s ? topThreatTypeFromCounts(s.byThreatType) : null
    base.push({
      key: 'threat',
      label: top ? formatThreatLabel(top.type) : 'Threats',
      value: showPlaceholder ? '—' : String(top?.count ?? 0),
      subtitle: top ? 'largest category' : null,
      icon: 'i-lucide-bug',
      iconClass: 'text-violet-600',
      valueClass: 'text-neutral-800'
    })
  } else {
    const npm = s?.byEcosystem.npm ?? 0
    const pypi = s?.byEcosystem.pypi ?? 0
    base.push({
      key: 'ecosystem',
      label: 'Ecosystem',
      value: showPlaceholder ? '—' : String(npm),
      subtitle: showPlaceholder ? null : `PyPI · ${pypi}`,
      icon: 'i-lucide-layers',
      iconClass: 'text-violet-600',
      valueClass: 'text-neutral-800'
    })
  }

  return base
})
</script>

<template>
  <div
    class="grid grid-cols-2 gap-px border-b border-[var(--feed-border)] bg-[var(--feed-border)] sm:grid-cols-4"
    data-testid="feed-stats"
  >
    <div
      v-for="card in cards"
      :key="card.key"
      class="bg-[var(--feed-surface)] px-4 py-3"
      :data-testid="`feed-stat-${card.key}`"
    >
      <div class="flex items-center gap-1.5">
        <UIcon :name="card.icon" class="size-3.5 shrink-0" :class="card.iconClass" />
        <p class="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          {{ card.label }}
        </p>
      </div>
      <p class="mt-0.5 font-mono text-xl tabular-nums" :class="card.valueClass">
        {{ card.value }}
      </p>
      <p v-if="card.subtitle" class="mt-0.5 text-[11px] text-neutral-600">
        {{ card.subtitle }}
      </p>
    </div>
  </div>
</template>
