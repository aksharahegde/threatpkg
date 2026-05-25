<script setup lang="ts">
import type { PackageDetail } from '#shared/types/threat'

defineProps<{
  detail: PackageDetail
}>()
</script>

<template>
  <section class="border-b border-neutral-200 px-4 py-4" data-testid="package-meta-section">
    <h1 class="font-mono text-xl text-cyan-600">
      {{ detail.reputation.packageName }}
    </h1>
    <p class="mt-1 text-sm uppercase text-neutral-500">
      {{ detail.reputation.ecosystem }}
    </p>
    <dl class="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
      <div>
        <dt class="text-neutral-500">Maintainers</dt>
        <dd class="text-neutral-800">{{ detail.maintainers.join(', ') || '—' }}</dd>
      </div>
      <div>
        <dt class="text-neutral-500">Incidents</dt>
        <dd class="text-neutral-800">{{ detail.reputation.incidentCount }}</dd>
      </div>
      <div>
        <dt class="text-neutral-500">Last updated</dt>
        <dd class="text-neutral-800">
          {{ new Date(detail.reputation.lastUpdated).toLocaleDateString() }}
        </dd>
      </div>
    </dl>
  </section>
</template>
