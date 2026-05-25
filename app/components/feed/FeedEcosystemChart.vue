<script setup lang="ts">
import type { FeedSummary } from '#shared/types/threat'

const props = defineProps<{
  summary: FeedSummary | null
  pending?: boolean
}>()

const distribution = computed(() => {
  const s = props.summary
  if (!s) return { npm: 0, pypi: 0, npmPct: 0, pypiPct: 0 }
  const npm = s.byEcosystem.npm ?? 0
  const pypi = s.byEcosystem.pypi ?? 0
  const total = npm + pypi || 1
  return {
    npm,
    pypi,
    npmPct: Math.round((npm / total) * 100),
    pypiPct: Math.round((pypi / total) * 100)
  }
})
</script>

<template>
  <section class="tp-panel rounded-sm p-4">
    <h2 class="tp-label">ECOSYSTEM_DISTRIBUTION</h2>
    <div class="mt-4 space-y-4">
      <div>
        <div class="mb-1 flex justify-between font-tp-mono text-[10px]">
          <span class="tp-eco-npm">NPM</span>
          <span class="text-[var(--tp-text-dim)]">{{ distribution.npmPct }}%</span>
        </div>
        <div
          class="h-1.5 overflow-hidden rounded-sm bg-[var(--tp-surface-inset)]"
        >
          <div
            class="h-full rounded-sm bg-[var(--tp-npm)] transition-all duration-500"
            :style="{ width: `${distribution.npmPct}%` }"
          />
        </div>
      </div>
      <div>
        <div class="mb-1 flex justify-between font-tp-mono text-[10px]">
          <span class="tp-eco-pypi">PYPI</span>
          <span class="text-[var(--tp-text-dim)]">{{ distribution.pypiPct }}%</span>
        </div>
        <div
          class="h-1.5 overflow-hidden rounded-sm bg-[var(--tp-surface-inset)]"
        >
          <div
            class="h-full rounded-sm bg-[var(--tp-pypi)] transition-all duration-500"
            :style="{ width: `${distribution.pypiPct}%` }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
