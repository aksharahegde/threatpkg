<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'
import { packagePagePath } from '#shared/utils/package-path'
import { ecosystemCssClass } from '~/utils/ecosystem'

const props = defineProps<{
  items: FeedIncident[]
  pending?: boolean
  loadingMore?: boolean
  selectedId?: string | null
}>()

const emit = defineEmits<{
  select: [item: FeedIncident]
}>()

const showInitialLoading = computed(
  () =>
    (props.pending && !props.items.length) ||
    (!props.items.length && import.meta.server)
)
const showEmpty = computed(
  () =>
    !props.pending &&
    !props.loadingMore &&
    !props.items.length &&
    !import.meta.server
)
const shimmerRows = 4

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diffH = (now - d.getTime()) / 3_600_000
  if (diffH < 24) return `${Math.max(1, Math.round(diffH))}H AGO`
  const diffD = Math.round(diffH / 24)
  if (diffD < 14) return `${diffD}D AGO`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function railColor(severity: string) {
  const map: Record<string, string> = {
    critical: 'var(--feed-rail-critical)',
    high: 'var(--feed-rail-high)',
    medium: 'var(--feed-rail-medium)',
    low: 'var(--feed-rail-low)'
  }
  return map[severity] ?? map.low
}

function severityLabel(severity: string) {
  return severity.toUpperCase()
}

function severityTextClass(severity: string) {
  if (severity === 'critical') return 'text-[var(--feed-rail-critical)]'
  if (severity === 'high') return 'text-[var(--feed-rail-high)]'
  if (severity === 'medium') return 'text-[var(--feed-rail-medium)]'
  return 'text-[var(--tp-text-dim)]'
}

function ecoBadgeClass(eco: string) {
  return ecosystemCssClass(eco)
}
</script>

<template>
  <div
    class="threat-feed-table feed-scanlines relative min-h-[12rem] flex-1 overflow-x-auto bg-[var(--tp-surface)]"
    data-testid="feed-table"
  >
    <div
      v-if="showInitialLoading"
      class="flex flex-col items-center justify-center gap-2 px-4 py-16 text-[var(--tp-text-dim)]"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-5 animate-spin text-[var(--tp-accent)]"
      />
      <span class="font-tp-mono text-xs uppercase tracking-wider">
        Scanning threats…
      </span>
    </div>

    <div
      v-else-if="showEmpty"
      class="flex flex-col items-center justify-center gap-2 px-4 py-16 text-[var(--tp-text-dim)]"
    >
      <UIcon name="i-lucide-shield-off" class="size-8 opacity-50" />
      <p class="font-tp-mono text-xs uppercase">No incidents match filters</p>
    </div>

    <ul v-else class="divide-y divide-[var(--tp-border)]" role="list">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="feed-row-enter group relative flex min-h-[var(--feed-row-height)] cursor-pointer items-stretch transition-colors"
        :class="
          selectedId === item.id
            ? 'bg-[var(--tp-accent-muted)]'
            : 'hover:bg-[var(--tp-surface-inset)]'
        "
        :style="{
          animationDelay: `${Math.min(index, 12) * 30}ms`,
          borderLeftWidth: '3px',
          borderLeftStyle: 'solid',
          borderLeftColor: railColor(item.severity)
        }"
        :data-testid="`feed-row-${item.id}`"
        @click="emit('select', item)"
      >
        <div
          class="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="font-tp-mono rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase"
                :class="ecoBadgeClass(item.ecosystem)"
              >
                {{ item.ecosystem }}
              </span>
              <NuxtLink
                :to="packagePagePath(item.ecosystem, item.packageName)"
                class="font-tp-mono text-sm font-semibold text-[var(--tp-text)] hover:text-[var(--tp-accent)]"
                data-testid="feed-package-link"
                @click.stop
              >
                {{ item.packageName }}
              </NuxtLink>
            </div>
            <p
              class="mt-1 line-clamp-2 text-xs leading-snug text-[var(--tp-text-muted)]"
            >
              {{ item.title }}
            </p>
            <div
              class="mt-1 flex flex-wrap items-center gap-x-2 font-tp-mono text-[10px] text-[var(--tp-text-dim)]"
            >
              <span>{{ item.source.toUpperCase() }}</span>
              <span>·</span>
              <time :datetime="item.publishedAt">{{ formatTime(item.publishedAt) }}</time>
            </div>
          </div>
          <div class="flex shrink-0 items-center sm:flex-col sm:items-end">
            <span
              class="font-tp-mono text-[10px] font-semibold uppercase tracking-wider"
              :class="severityTextClass(item.severity)"
            >
              {{ severityLabel(item.severity) }}
            </span>
          </div>
        </div>
      </li>
      <template v-if="loadingMore">
        <li
          v-for="n in shimmerRows"
          :key="`shimmer-${n}`"
          class="flex min-h-[var(--feed-row-height)] animate-pulse items-stretch border-l-[3px] border-l-transparent px-4 py-3"
          aria-hidden="true"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="h-4 w-24 rounded-sm bg-[var(--tp-border)]" />
            <div class="h-3 max-w-md w-[85%] rounded-sm bg-[var(--tp-border)]" />
            <div class="h-2.5 w-32 rounded-sm bg-[var(--tp-border)]" />
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>
