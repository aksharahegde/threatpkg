<script setup lang="ts">
interface SourcesResponse {
  lastSyncedAt: string | null
  sources: {
    name: string
    lastSyncedAt: string | null
    enabled: boolean
  }[]
}

const { data } = useFetch<SourcesResponse>('/api/sources', {
  server: false,
  default: () => ({ lastSyncedAt: null, sources: [] })
})

const isLive = computed(() => {
  const at = data.value?.lastSyncedAt
  if (!at) return false
  return Date.now() - new Date(at).getTime() < 30 * 60_000
})

const statusLabel = computed(() =>
  isLive.value ? 'SYSTEM LIVE' : 'SYNC STALE'
)

const shortStatusLabel = computed(() =>
  isLive.value ? 'LIVE' : 'STALE'
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 font-tp-mono text-[10px] uppercase tracking-wider text-[var(--tp-text-muted)]"
    :aria-label="statusLabel"
    :title="
      data?.sources
        ?.map((s) => `${s.name}: ${s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString() : 'never'}`)
        .join('\n') ?? ''
    "
    data-testid="feed-freshness"
  >
    <span
      class="size-1.5 rounded-full"
      :class="isLive ? 'bg-[var(--tp-live)] tp-live-dot' : 'bg-amber-500'"
    />
    <span
      class="sm:hidden"
      :class="isLive ? 'text-[var(--tp-live)]' : ''"
    >
      {{ shortStatusLabel }}
    </span>
    <span
      class="hidden sm:inline"
      :class="isLive ? 'text-[var(--tp-live)]' : ''"
    >
      {{ statusLabel }}
    </span>
  </span>
</template>
