import type { ChangelogResponse } from '#shared/types/changelog'

export function useChangelog() {
  const { data, pending, error, refresh } = useFetch<ChangelogResponse>('/api/changelog')

  const releases = computed(() => data.value?.releases ?? [])

  return {
    releases,
    pending,
    error,
    refresh
  }
}
