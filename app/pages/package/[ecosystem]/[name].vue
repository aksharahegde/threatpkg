<script setup lang="ts">
import type { PackageDetail } from '#shared/types/threat'
import { ECOSYSTEMS } from '#shared/types/threat'
import { packageMetaDescription } from '#shared/utils/seo'
import { packagePagePath } from '#shared/utils/package-path'
import { getEcosystemMeta } from '#shared/constants/ecosystems'

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

const ecoLabel = computed(
  () => getEcosystemMeta(ecosystem.value)?.label ?? ecosystem.value
)

const packagePath = computed(() => packagePagePath(ecosystem.value, name.value))

const breadcrumbPrepend = [{ label: 'Threat feed', to: '/' }]

const breadcrumbAppend = computed(() => [
  {
    label: name.value,
    current: true,
    labelClass: 'font-mono text-[var(--tp-text)]'
  }
])

usePageSeo({
  title: () => name.value,
  ogTitle: () => `${name.value} (${ecoLabel.value})`,
  description: () =>
    data.value
      ? packageMetaDescription({
          packageName: name.value,
          ecosystem: ecosystem.value,
          incidentCount: data.value.reputation.incidentCount,
          riskScore: data.value.reputation.riskScore
        })
      : `Package reputation and supply-chain incident history for ${name.value} (${ecoLabel.value}) on ThreatPkg.`
})
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-[var(--tp-surface)]">
    <LayoutAppHeader title="Package reputation" />

    <LayoutPageBreadcrumb
      :path="packagePath"
      :prepend="breadcrumbPrepend"
      :append="breadcrumbAppend"
    />

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
