<script setup lang="ts">
import { defineSoftwareApp, defineWebPage } from '@unhead/schema-org/vue'
import type { PackageDetail } from '#shared/types/threat'
import { ECOSYSTEMS } from '#shared/types/threat'
import { absoluteSiteUrl, packageMetaDescription } from '#shared/utils/seo'
import { packagePagePath } from '#shared/utils/package-path'
import { getEcosystemMeta } from '#shared/constants/ecosystems'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const site = useSiteConfig()
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

const breadcrumbPrepend = [{ label: 'Threat feed', to: '/' }]

const breadcrumbAppend = computed(() => [
  {
    label: name.value,
    current: true,
    labelClass: 'font-mono text-[var(--tp-text)]'
  }
])

function packageSeoDescription(detail: PackageDetail) {
  const latest = detail.incidents[0]
  return packageMetaDescription({
    packageName: detail.reputation.packageName,
    ecosystem: detail.reputation.ecosystem,
    incidentCount: detail.reputation.incidentCount,
    riskScore: detail.reputation.riskScore,
    latestIncident: latest
      ? { title: latest.title, severity: latest.severity }
      : undefined
  })
}

usePageSeo({
  title: () => name.value,
  ogTitle: () => `${name.value} (${ecoLabel.value})`,
  description: () =>
    data.value
      ? packageSeoDescription(data.value)
      : `Package reputation and supply-chain incident history for ${name.value} (${ecoLabel.value}) on ThreatPkg.`
})

defineOgImage('PackageDetail', {
  packageName: () => data.value?.reputation?.packageName ?? name.value,
  ecosystemLabel: () => ecoLabel.value,
  riskScore: () => data.value?.reputation?.riskScore ?? 0,
  incidentCount: () => data.value?.reputation?.incidentCount ?? 0,
  siteName: () => site.name
})

useSchemaOrg(
  computed(() => {
    const rep = data.value?.reputation
    if (!rep) return []
    const pageUrl = absoluteSiteUrl(
      packagePagePath(rep.ecosystem, rep.packageName),
      site.url
    )
    const description = packageSeoDescription(data.value!)
    const pageName = `${rep.packageName} (${ecoLabel.value})`
    return [
      defineWebPage({
        '@type': 'WebPage',
        name: pageName,
        description,
        url: pageUrl
      }),
      defineSoftwareApp({
        name: rep.packageName,
        description
      })
    ]
  })
)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-[var(--tp-surface)]">
    <LayoutAppHeader title="Package reputation" />

    <LayoutPageBreadcrumb
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
