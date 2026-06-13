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

const lastSyncedAt = computed(() => data.value?.lastSyncedAt ?? null)

const isLive = computed(() => {
  const at = lastSyncedAt.value
  if (!at) return false
  return Date.now() - new Date(at).getTime() < 30 * 60_000
})

function formatSyncTime(iso: string, compact: boolean) {
  const d = new Date(iso)
  if (compact) {
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const displayLabel = computed(() => {
  if (isLive.value) {
    return { short: 'LIVE', long: 'SYSTEM LIVE', aria: 'SYSTEM LIVE' }
  }
  if (!lastSyncedAt.value) {
    return { short: '—', long: 'Sync time unknown', aria: 'Sync time unknown' }
  }
  const formatted = formatSyncTime(lastSyncedAt.value, false)
  const compact = formatSyncTime(lastSyncedAt.value, true)
  return {
    short: compact,
    long: formatted,
    aria: `Last synced ${formatted}`
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 font-tp-mono text-[10px] uppercase tracking-wider text-[var(--tp-text-muted)]"
    :aria-label="displayLabel.aria"
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
      class="normal-case sm:hidden"
      :class="isLive ? 'text-[var(--tp-live)]' : ''"
    >
      {{ displayLabel.short }}
    </span>
    <span
      class="hidden normal-case sm:inline"
      :class="isLive ? 'text-[var(--tp-live)]' : ''"
    >
      {{ displayLabel.long }}
    </span>
  </span>
</template>
