import type { FeedIncident, FeedQuery, FeedResponse } from '#shared/types/threat'

export function useThreatFeed(initial?: Partial<FeedQuery>) {
  const filters = reactive<FeedQuery>({
    ecosystem: initial?.ecosystem,
    severity: initial?.severity,
    threatType: initial?.threatType,
    source: initial?.source,
    range: initial?.range ?? '7d',
    q: initial?.q ?? '',
    sort: initial?.sort ?? 'published',
    cursor: undefined,
    limit: 20
  })

  const query = computed(() => ({
    ecosystem: filters.ecosystem || undefined,
    severity: filters.severity || undefined,
    threatType: filters.threatType || undefined,
    source: filters.source || undefined,
    range: filters.range || undefined,
    q: filters.q || undefined,
    sort: filters.sort,
    cursor: filters.cursor,
    limit: filters.limit
  }))

  const { data, pending, refresh, error } = useFetch<FeedResponse>('/api/feed', {
    query,
    watch: [query]
  })

  const accumulated = ref<FeedIncident[]>([])

  watch(
    () => [
      filters.ecosystem,
      filters.severity,
      filters.threatType,
      filters.source,
      filters.range,
      filters.q,
      filters.sort
    ],
    () => {
      filters.cursor = undefined
    }
  )

  watch(
    () => data.value?.items,
    (pageItems) => {
      if (!pageItems) return
      if (!filters.cursor) {
        accumulated.value = pageItems
        return
      }
      const seen = new Set(accumulated.value.map((i) => i.id))
      for (const item of pageItems) {
        if (!seen.has(item.id)) {
          accumulated.value.push(item)
        }
      }
    },
    { immediate: true }
  )

  const items = computed(() => accumulated.value)
  const summary = computed(() => data.value?.summary ?? null)
  const trend = computed(() => data.value?.trend ?? [])
  const nextCursor = computed(() => data.value?.nextCursor ?? null)
  const loadingMore = computed(() => pending.value && !!filters.cursor)

  function setFilter<K extends keyof FeedQuery>(key: K, value: FeedQuery[K]) {
    filters[key] = value
    filters.cursor = undefined
  }

  function loadMore() {
    if (nextCursor.value && !pending.value) {
      filters.cursor = nextCursor.value
    }
  }

  async function refreshFeed() {
    filters.cursor = undefined
    await refresh()
  }

  useIntervalFn(() => {
    refreshFeed()
  }, 60_000)

  return {
    filters,
    items,
    summary,
    trend,
    nextCursor,
    pending,
    loadingMore,
    error,
    refresh: refreshFeed,
    setFilter,
    loadMore
  }
}
