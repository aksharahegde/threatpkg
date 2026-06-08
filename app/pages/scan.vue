<script setup lang="ts">
import type { DependencyFileInput } from '#shared/types/scan'

definePageMeta({ layout: 'dashboard' })

usePageSeo({
  title: 'Dependency Scan',
  description:
    'Upload package-lock.json, poetry.lock, requirements.txt, or package.json to check indexed compromise incidents for your pinned dependency versions.',
  ogTitle: 'Dependency Scan'
})

const { response, pending, error, scan } = useDependencyScan()

async function onSubmit(files: DependencyFileInput[]) {
  await scan(files)
}

const showOnlyIssues = ref(false)
const resultSearch = ref('')

const visibleResults = computed(() => {
  let items = response.value?.results ?? []
  if (showOnlyIssues.value) {
    items = items.filter((r) => r.status !== 'safe')
  }

  const query = resultSearch.value.trim().toLowerCase()
  if (!query) return items

  return items.filter(
    (r) =>
      r.packageName.toLowerCase().includes(query) ||
      r.installedVersion.toLowerCase().includes(query) ||
      r.ecosystem.toLowerCase().includes(query) ||
      r.status.toLowerCase().includes(query)
  )
})

const resultsEmptyLabel = computed(() => {
  if (resultSearch.value.trim()) return 'No packages match your search.'
  if (showOnlyIssues.value) return 'No compromised or unknown packages.'
  return 'No dependencies parsed yet.'
})
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-[var(--tp-surface)]">
    <LayoutAppHeader
      title="Dependency scan"
      subtitle="Check manifests against indexed compromise incidents"
    />

    <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6">
      <p class="text-sm leading-relaxed text-[var(--tp-text-muted)]">
        Upload or paste lock files and manifests. ThreatPkg matches package names and
        versions against malware and supply-chain incidents (local index plus live OSV
        malware checks)—not every CVE. Prefer
        <span class="font-tp-mono text-[var(--tp-text)]">package-lock.json</span>,
        <span class="font-tp-mono text-[var(--tp-text)]">yarn.lock</span>,
        <span class="font-tp-mono text-[var(--tp-text)]">bun.lock</span>,
        <span class="font-tp-mono text-[var(--tp-text)]">pnpm-lock.yaml</span>, or
        <span class="font-tp-mono text-[var(--tp-text)]">poetry.lock</span>
        for exact versions.
      </p>

      <ScanManifestForm :pending="pending" @submit="onSubmit" />

      <p v-if="error" class="font-tp-mono text-xs text-red-500">{{ error }}</p>

      <section v-if="response" class="space-y-4">
        <p
          v-if="response.summary.compromised === 0 && response.summary.unknown === 0"
          class="rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface-raised)] px-4 py-3 text-sm text-[var(--tp-text-muted)]"
          data-testid="scan-all-safe-note"
        >
          No malware matches for {{ response.summary.total }} pinned
          {{ response.summary.total === 1 ? 'dependency' : 'dependencies' }}.
          <template v-if="response.summary.indexedNameMatches === 0">
            None of these package names appear in the local malware incident index.
          </template>
          <template v-else>
            {{ response.summary.indexedNameMatches }}
            {{ response.summary.indexedNameMatches === 1 ? 'name matches' : 'names match' }}
            the index, but installed versions were not flagged.
          </template>
          This scan checks supply-chain malware incidents, not every CVE.
        </p>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div class="tp-panel rounded-sm px-3 py-2">
            <p class="tp-label">Total</p>
            <p class="font-tp-mono text-lg text-[var(--tp-text)]">
              {{ response.summary.total }}
            </p>
          </div>
          <div class="tp-panel rounded-sm px-3 py-2">
            <p class="tp-label">Compromised</p>
            <p class="font-tp-mono text-lg text-red-400">
              {{ response.summary.compromised }}
            </p>
          </div>
          <div class="tp-panel rounded-sm px-3 py-2">
            <p class="tp-label">Unknown</p>
            <p class="font-tp-mono text-lg text-amber-400">
              {{ response.summary.unknown }}
            </p>
          </div>
          <div class="tp-panel rounded-sm px-3 py-2">
            <p class="tp-label">Safe</p>
            <p class="font-tp-mono text-lg text-emerald-500">
              {{ response.summary.safe }}
            </p>
          </div>
          <div class="tp-panel rounded-sm px-3 py-2">
            <p class="tp-label">Parse warnings</p>
            <p class="font-tp-mono text-lg text-[var(--tp-text)]">
              {{ response.summary.warnings }}
            </p>
          </div>
        </div>

        <div
          class="flex flex-wrap items-center justify-between gap-3"
          data-testid="scan-results-filters"
        >
          <label class="inline-flex items-center gap-2 font-tp-mono text-xs text-[var(--tp-text-muted)]">
            <input v-model="showOnlyIssues" type="checkbox" class="rounded-sm" />
            Show only compromised / unknown
          </label>

          <div class="relative min-w-0 flex-1 sm:max-w-xs" data-testid="scan-results-search">
            <UIcon
              name="i-lucide-search"
              class="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--tp-text-dim)]"
            />
            <input
              v-model="resultSearch"
              type="search"
              placeholder="Search packages…"
              class="font-tp-mono w-full rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface-inset)] py-1.5 pl-8 pr-3 text-xs text-[var(--tp-text)] placeholder:text-[var(--tp-text-dim)] focus:border-[var(--tp-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--tp-accent)]"
              data-testid="scan-results-search-input"
            />
          </div>
        </div>

        <ScanResultsTable
          :results="visibleResults"
          :pending="pending"
          :empty-label="resultsEmptyLabel"
        />

        <div
          v-if="response.warnings.length"
          class="tp-panel rounded-sm px-4 py-3"
        >
          <p class="tp-label">Parse warnings</p>
          <ul class="mt-2 space-y-1 font-tp-mono text-[10px] text-[var(--tp-text-dim)]" role="list">
            <li v-for="(w, i) in response.warnings" :key="i">{{ w }}</li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>
