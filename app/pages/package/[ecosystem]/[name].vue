<script setup lang="ts">
import type { PackageDetail } from '#shared/types/threat'
import { ECOSYSTEMS } from '#shared/types/threat'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const ecosystem = computed(() => route.params.ecosystem as string)
const name = computed(() => decodeURIComponent(route.params.name as string))

if (!(ECOSYSTEMS as readonly string[]).includes(ecosystem.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Invalid ecosystem' })
}

const { data, pending, error } = await useFetch<PackageDetail>(
  () =>
    `/api/packages/${ecosystem.value}/${encodeURIComponent(name.value)}`
)

useSeoMeta({
  title: () => name.value,
  description: () =>
    `Package reputation and supply-chain incident history for ${name.value} (${ecosystem.value}) on ThreatPkg.`,
  ogTitle: () => `${name.value} (${ecosystem.value}) · ThreatPkg`,
  ogDescription: () =>
    `Package reputation and supply-chain incident history for ${name.value} (${ecosystem.value}) on ThreatPkg.`
})
</script>

<template>
  <div>
    <LayoutAppHeader title="Package reputation" />
    <div v-if="pending" class="px-4 py-8 text-neutral-500">Loading…</div>
    <div v-else-if="error || !data" class="px-4 py-8 text-red-600">
      Package not found.
    </div>
    <template v-else>
      <PackageMeta :detail="data" />
      <PackageReputationScore
        :risk-score="data.reputation.riskScore"
        :incident-count="data.reputation.incidentCount"
      />
      <PackageIncidentHistory
        :incidents="data.incidents"
        :signals="data.suspiciousSignals"
      />
      <ChartsRiskTrend />
    </template>
  </div>
</template>
