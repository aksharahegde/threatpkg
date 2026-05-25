<script setup lang="ts">
defineProps<{
  riskScore: number
  incidentCount: number
}>()
</script>

<template>
  <section
    class="border-b border-neutral-200 px-4 py-4"
    data-testid="package-reputation-score"
  >
    <h2 class="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
      Reputation score
    </h2>
    <p class="font-mono text-4xl tabular-nums text-neutral-900">
      {{ riskScore }}
    </p>
    <p class="mt-1 text-sm text-neutral-500">
      Based on {{ incidentCount }} indexed incident(s)
    </p>
  </section>
</template>
