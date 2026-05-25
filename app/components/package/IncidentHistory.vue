<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'

defineProps<{
  incidents: FeedIncident[]
  signals: string[]
}>()
</script>

<template>
  <section class="px-4 py-4" data-testid="package-incident-history">
    <h2 class="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
      Suspicious signals
    </h2>
    <ul v-if="signals.length" class="mb-4 list-inside list-disc text-sm text-amber-600/90">
      <li v-for="(s, i) in signals" :key="i">{{ s }}</li>
    </ul>
    <p v-else class="mb-4 text-sm text-neutral-600">No signals detected.</p>
    <h2 class="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
      Incident history
    </h2>
    <ul class="space-y-2">
      <li
        v-for="inc in incidents"
        :key="inc.id"
        class="rounded border border-neutral-200 px-3 py-2 text-sm"
        :data-testid="`package-incident-row-${inc.id}`"
      >
        <NuxtLink :to="`/incident/${inc.id}`" class="text-cyan-600 hover:text-cyan-700">
          {{ inc.title }}
        </NuxtLink>
        <p class="mt-0.5 text-xs text-neutral-500">
          {{ inc.severity }} · risk {{ inc.riskScore }} · {{ inc.source }}
        </p>
      </li>
    </ul>
  </section>
</template>
