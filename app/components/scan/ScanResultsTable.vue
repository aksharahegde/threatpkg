<script setup lang="ts">
import type { ScanPackageResult } from '#shared/types/scan'
import { packagePagePath } from '#shared/utils/package-path'

defineProps<{
  results: ScanPackageResult[]
  pending?: boolean
  emptyLabel?: string
}>()

function statusLabel(status: ScanPackageResult['status']) {
  const map = {
    compromised: 'COMPROMISED',
    unknown: 'UNKNOWN',
    safe: 'SAFE'
  }
  return map[status]
}

function statusClass(status: ScanPackageResult['status']) {
  const map = {
    compromised: 'text-red-400',
    unknown: 'text-amber-400',
    safe: 'text-emerald-500'
  }
  return map[status]
}

function upgradeCommand(result: ScanPackageResult) {
  if (!result.minFixedVersion) return null
  if (result.ecosystem === 'npm') {
    return `npm install ${result.packageName}@${result.minFixedVersion}`
  }
  return `pip install ${result.packageName}==${result.minFixedVersion}`
}
</script>

<template>
  <div
    class="feed-scanlines relative min-h-[8rem] overflow-x-auto rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface)]"
    data-testid="scan-results-table"
  >
    <div
      v-if="pending"
      class="flex items-center justify-center gap-2 py-12 font-tp-mono text-xs text-[var(--tp-text-dim)]"
    >
      <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
      Scanning…
    </div>

    <table v-else-if="results.length" class="w-full min-w-[640px] text-left text-xs">
      <thead class="border-b border-[var(--tp-border)] bg-[var(--tp-surface-raised)]">
        <tr class="tp-label">
          <th class="px-3 py-2 font-normal">Package</th>
          <th class="px-3 py-2 font-normal">Ecosystem</th>
          <th class="px-3 py-2 font-normal">Installed</th>
          <th class="px-3 py-2 font-normal">Status</th>
          <th class="px-3 py-2 font-normal">Min safe version</th>
          <th class="px-3 py-2 font-normal">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in results"
          :key="`${row.ecosystem}-${row.packageName}@${row.installedVersion}`"
          class="border-b border-[var(--tp-border)] last:border-0"
          :data-testid="`scan-row-${row.packageName}`"
        >
          <td class="px-3 py-2">
            <NuxtLink
              :to="packagePagePath(row.ecosystem, row.packageName)"
              class="font-tp-mono text-[var(--tp-accent)] hover:opacity-80"
            >
              {{ row.packageName }}
            </NuxtLink>
          </td>
          <td class="px-3 py-2 font-tp-mono uppercase text-[var(--tp-text-muted)]">
            {{ row.ecosystem }}
          </td>
          <td class="px-3 py-2 font-tp-mono text-[var(--tp-text)]">
            {{ row.installedVersion }}
          </td>
          <td class="px-3 py-2 font-tp-mono" :class="statusClass(row.status)">
            {{ statusLabel(row.status) }}
          </td>
          <td class="px-3 py-2 font-tp-mono text-[var(--tp-text)]">
            <template v-if="row.minFixedVersion">{{ row.minFixedVersion }}</template>
            <span v-else class="text-[var(--tp-text-dim)]">—</span>
          </td>
          <td class="px-3 py-2">
            <template v-if="row.status !== 'safe'">
              <code
                v-if="upgradeCommand(row)"
                class="block max-w-xs truncate font-tp-mono text-[10px] text-[var(--tp-text-muted)]"
                :data-testid="`scan-upgrade-row-${row.packageName}`"
              >
                {{ upgradeCommand(row) }}
              </code>
              <NuxtLink
                v-if="row.incidents[0] && !row.incidents[0].id.startsWith('osv:')"
                :to="`/incident/${row.incidents[0].id}`"
                class="mt-1 block text-[var(--tp-accent)] hover:opacity-80"
              >
                View incident
              </NuxtLink>
              <a
                v-else-if="row.incidents[0]?.sourceUrl"
                :href="row.incidents[0].sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-1 block text-[var(--tp-accent)] hover:opacity-80"
              >
                View OSV advisory
              </a>
              <span
                v-else-if="row.status === 'unknown'"
                class="text-[var(--tp-text-dim)]"
              >
                Verify manually
              </span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <p
      v-else
      class="py-12 text-center font-tp-mono text-xs text-[var(--tp-text-dim)]"
    >
      {{ emptyLabel ?? 'No dependencies parsed yet.' }}
    </p>
  </div>
</template>
