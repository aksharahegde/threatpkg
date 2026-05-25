<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'

definePageMeta({ layout: 'dashboard' })

useSeoMeta({
  title: 'Live threat feed',
  description:
    'Open-source package threat intelligence feed for npm, PyPI, Go, Rust, Java, .NET, and RubyGems: compromised packages, supply-chain attacks, and advisory IDs.',
  ogTitle: 'Live threat feed · ThreatPkg',
  ogDescription:
    'Realtime open-source package threat intelligence across major package ecosystems.'
})

const {
  filters,
  items,
  summary,
  trend,
  pending,
  loadingMore,
  refresh,
  setFilter,
  nextCursor,
  loadMore
} = useThreatFeed({ range: '7d' })

const selectedId = ref<string | null>(null)

const selectedItem = computed<FeedIncident | null>(() => {
  if (!items.value.length) return null
  if (selectedId.value) {
    return items.value.find((i) => i.id === selectedId.value) ?? items.value[0]
  }
  return items.value[0]
})

watch(
  () => items.value[0]?.id,
  (id) => {
    if (!id) {
      selectedId.value = null
      return
    }
    if (!selectedId.value || !items.value.some((i) => i.id === selectedId.value)) {
      selectedId.value = id
    }
  },
  { immediate: true }
)

function selectItem(item: FeedIncident) {
  selectedId.value = item.id
}

watch(
  () => filters.q,
  () => setFilter('q', filters.q)
)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
    <aside
      class="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-[var(--tp-border)] bg-[var(--tp-bg)] p-4 lg:w-72 lg:border-b-0 lg:border-r"
    >
      <div>
        <h1
          class="text-lg font-semibold leading-tight tracking-tight text-[var(--tp-text)] sm:text-xl"
        >
          Realtime package threat intelligence
        </h1>
        <p class="mt-1 text-xs leading-relaxed text-[var(--tp-text-muted)]">
          Supply-chain incidents across major ecosystems · refreshes every minute
        </p>
      </div>

      <FeedCriticalMetrics
        :summary="summary"
        :pending="pending && !summary"
        :range="filters.range"
      />
      <FeedEcosystemChart :summary="summary" :pending="pending && !summary" />
      <ChartsFeedTrendChart :counts="trend" :range="filters.range" />
    </aside>

    <main class="flex min-h-0 min-w-0 flex-1 flex-col">
      <FeedFilters v-model:filters="filters" @refresh="refresh()">
        <template #count>
          <span class="font-tp-mono text-[10px] text-[var(--tp-text-dim)]">
            {{ items.length }} items
          </span>
        </template>
      </FeedFilters>

      <div class="border-b border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 lg:hidden">
        <FeedInspector :item="selectedItem" />
      </div>
      <FeedThreatFeedTable
        :items="items"
        :pending="pending"
        :loading-more="loadingMore"
        :selected-id="selectedId"
        @select="selectItem"
      />
      <div
        v-if="nextCursor"
        class="shrink-0 border-t border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-3 text-center"
      >
        <div data-testid="feed-load-more">
          <button
            type="button"
            class="tp-pill rounded-sm px-4 py-2"
            :disabled="pending"
            @click="loadMore()"
          >
            <UIcon
              v-if="loadingMore"
              name="i-lucide-loader-circle"
              class="me-1.5 inline size-3.5 animate-spin"
            />
            Load more incidents
          </button>
        </div>
      </div>
    </main>

    <aside
      class="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-[var(--tp-border)] bg-[var(--tp-bg)] p-4 lg:flex"
    >
      <FeedInspector :item="selectedItem" />
      <FeedRecentDisclosures :items="items" />
    </aside>
  </div>
</template>
