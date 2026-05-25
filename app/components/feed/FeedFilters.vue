<script setup lang="ts">
import { ECOSYSTEM_META } from '#shared/constants/ecosystems'
import {
  THREAT_TYPES,
  SOURCES,
  type Ecosystem,
  type FeedQuery
} from '#shared/types/threat'

const filters = defineModel<Partial<FeedQuery>>('filters', { required: true })

const emit = defineEmits<{
  refresh: []
}>()

type FilterPill =
  | { key: 'all'; label: string; active: boolean }
  | { key: 'critical'; label: string; active: boolean }
  | { key: Ecosystem; label: string; active: boolean; eco: Ecosystem }

const pillFilters = computed((): FilterPill[] => [
  {
    key: 'all',
    label: 'ALL',
    active: !filters.value.ecosystem && !filters.value.severity
  },
  ...ECOSYSTEM_META.map(
    (meta): FilterPill => ({
      key: meta.id,
      label: meta.label,
      active: filters.value.ecosystem === meta.id,
      eco: meta.id
    })
  ),
  {
    key: 'critical',
    label: 'CRITICAL',
    active: filters.value.severity === 'critical'
  }
])

function setAll() {
  filters.value.ecosystem = undefined
  filters.value.severity = undefined
}

function setEcosystem(eco: Ecosystem) {
  filters.value.ecosystem = filters.value.ecosystem === eco ? undefined : eco
  filters.value.severity = undefined
}

function setCritical() {
  filters.value.severity =
    filters.value.severity === 'critical' ? undefined : 'critical'
}

function onPillClick(pill: FilterPill) {
  if (pill.key === 'all') setAll()
  else if (pill.key === 'critical') setCritical()
  else setEcosystem(pill.eco)
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-2 border-b border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2.5"
    data-testid="feed-filters"
  >
    <span class="tp-label mr-1">THREAT_FEED</span>
    <slot name="count" />

    <div class="ms-auto flex flex-wrap items-center gap-1.5">
      <button
        v-for="pill in pillFilters"
        :key="pill.key"
        type="button"
        class="tp-pill rounded-sm px-2.5 py-1"
        :class="{ 'tp-pill--active': pill.active }"
        :data-testid="`feed-filter-${pill.key}`"
        @click="onPillClick(pill)"
      >
        {{ pill.label }}
      </button>

      <div class="hidden w-px self-stretch bg-[var(--tp-border)] sm:block" />

      <div class="hidden w-28 md:block" data-testid="feed-filter-threat-type">
        <USelect
          :model-value="filters.threatType"
          placeholder="Type"
          size="xs"
          class="w-full font-tp-mono"
          :items="[
            { label: 'ALL TYPES', value: undefined },
            ...THREAT_TYPES.map((t) => ({
              label: t.replace(/_/g, ' ').toUpperCase(),
              value: t
            }))
          ]"
          :ui="{
            base: 'bg-[var(--tp-surface-inset)] ring-[var(--tp-border)] text-[var(--tp-text)] font-tp-mono text-[10px]'
          }"
          @update:model-value="filters.threatType = $event as FeedQuery['threatType']"
        />
      </div>

      <div class="hidden w-24 md:block" data-testid="feed-filter-source">
        <USelect
          :model-value="filters.source"
          placeholder="Source"
          size="xs"
          class="w-full font-tp-mono"
          :items="[
            { label: 'ALL SRC', value: undefined },
            ...SOURCES.map((s) => ({ label: s.toUpperCase(), value: s }))
          ]"
          :ui="{
            base: 'bg-[var(--tp-surface-inset)] ring-[var(--tp-border)] text-[var(--tp-text)] font-tp-mono text-[10px]'
          }"
          @update:model-value="filters.source = $event as FeedQuery['source']"
        />
      </div>

      <div class="hidden w-24 sm:block" data-testid="feed-filter-time-range">
        <USelect
          :model-value="filters.range"
          size="xs"
          class="w-full font-tp-mono"
          :items="[
            { label: '24H', value: '24h' },
            { label: '7D', value: '7d' },
            { label: '30D', value: '30d' }
          ]"
          :ui="{
            base: 'bg-[var(--tp-surface-inset)] ring-[var(--tp-border)] text-[var(--tp-text)] font-tp-mono text-[10px]'
          }"
          @update:model-value="filters.range = $event as FeedQuery['range']"
        />
      </div>

      <div data-testid="feed-refresh-button">
        <button
          type="button"
          class="tp-pill rounded-sm px-2 py-1"
          @click="emit('refresh')"
        >
          <UIcon name="i-lucide-refresh-cw" class="size-3" />
        </button>
      </div>
    </div>
  </div>
</template>
