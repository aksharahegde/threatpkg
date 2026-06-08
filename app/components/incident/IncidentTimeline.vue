<script setup lang="ts">
import { shouldCollapseIndicatorValue } from '#shared/utils/incident-description'

defineProps<{
  timeline: { at: string; label: string }[]
  affectedVersions: string[]
  indicators: { indicatorType: string; value: string; confidence: number }[]
}>()

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function indicatorLabel(type: string) {
  if (type === 'alias') return 'Advisory IDs'
  return type.replace(/_/g, ' ')
}
</script>

<template>
  <section
    class="border-b border-[var(--tp-border)] px-4 py-5 sm:px-6"
    data-testid="incident-timeline-section"
  >
    <h2 class="tp-label">Technical details</h2>

    <div v-if="affectedVersions.length" class="mt-4">
      <p class="tp-label">Affected versions</p>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <span
          v-for="(ver, i) in affectedVersions"
          :key="i"
          class="rounded border border-[var(--tp-border)] bg-[var(--tp-surface-raised)] px-2 py-0.5 font-mono text-[11px] text-[var(--tp-text-muted)]"
        >
          {{ ver }}
        </span>
      </div>
    </div>

    <div v-if="indicators.length" class="mt-5">
      <p class="tp-label">Indicators</p>
      <ul
        class="mt-2 divide-y divide-[var(--tp-border)] rounded-md border border-[var(--tp-border)]"
      >
        <li
          v-for="(ind, i) in indicators"
          :key="i"
          class="flex items-center justify-between gap-3 bg-[var(--tp-surface-raised)] px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md"
        >
          <span class="min-w-0 flex-1">
            <IncidentCopyableDigest
              v-if="shouldCollapseIndicatorValue(ind.value, ind.indicatorType)"
              :label="indicatorLabel(ind.indicatorType)"
              :value="ind.value"
              :testid="`incident-indicator-copy-${i}`"
            />
            <template v-else>
              <span class="tp-label">{{ indicatorLabel(ind.indicatorType) }}</span>
              <span
                class="mt-0.5 block truncate font-mono text-xs text-[var(--tp-text-muted)]"
              >{{ ind.value }}</span>
            </template>
          </span>
          <span class="shrink-0 font-mono text-xs tabular-nums text-[var(--tp-text-dim)]">
            {{ ind.confidence }}%
          </span>
        </li>
      </ul>
    </div>

    <div class="mt-5">
      <p class="tp-label">Timeline</p>
      <ol class="relative mt-3 space-y-0 border-l border-[var(--tp-border)] pl-4">
        <li
          v-for="(entry, i) in timeline"
          :key="i"
          class="relative pb-4 last:pb-0"
        >
          <span
            class="absolute -left-[calc(0.5rem+1px)] top-1.5 size-2 rounded-full bg-[var(--tp-accent)] ring-2 ring-[var(--tp-surface)]"
            aria-hidden="true"
          />
          <time class="block text-[11px] text-[var(--tp-text-dim)]">{{
            formatTime(entry.at)
          }}</time>
          <span class="mt-0.5 block text-sm text-[var(--tp-text-muted)]">{{
            entry.label
          }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>
