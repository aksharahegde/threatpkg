<script setup lang="ts">
import { defineArticle } from '@unhead/schema-org/vue'
import { absoluteSiteUrl, incidentMetaDescription } from '#shared/utils/seo'
import { packagePagePath } from '#shared/utils/package-path'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const id = computed(() => route.params.id as string)
const { data: incident, pending, error } = useIncident(id)

const site = useSiteConfig()

const showLoading = computed(
  () => pending.value || (!incident.value && !error.value && import.meta.server)
)

const breadcrumbPrepend = [{ label: 'Threat feed', to: '/' }]

const breadcrumbAppend = computed(() => {
  const inc = incident.value
  if (!inc) return []
  return [
    {
      label: inc.packageName,
      to: packagePagePath(inc.ecosystem, inc.packageName),
      labelClass: 'font-mono text-[var(--tp-accent)]'
    },
    {
      label: inc.title,
      current: true
    }
  ]
})

usePageSeo({
  title: () => incident.value?.title ?? 'Incident',
  description: () =>
    incident.value
      ? incidentMetaDescription(incident.value)
      : 'Supply-chain incident detail from the ThreatPkg threat intelligence feed.'
})

useSchemaOrg(
  computed(() => {
    const inc = incident.value
    if (!inc) return []
    const pageUrl = absoluteSiteUrl(`/incident/${inc.id}`, site.url)
    return [
      defineArticle({
        '@type': 'NewsArticle',
        headline: inc.title,
        datePublished: inc.publishedAt,
        dateModified: inc.createdAt,
        description: incidentMetaDescription(inc),
        url: pageUrl,
        author: {
          '@type': 'Organization',
          name: site.name,
          url: site.url
        }
      })
    ]
  })
)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-[var(--tp-surface)]">
    <LayoutAppHeader
      title="Incident detail"
      subtitle="Supply-chain threat intelligence"
    />

    <LayoutPageBreadcrumb
      :prepend="breadcrumbPrepend"
      :append="breadcrumbAppend"
    />

    <div
      v-if="showLoading"
      class="flex flex-col items-center justify-center gap-2 px-4 py-20 text-[var(--tp-text-dim)]"
    >
      <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-[var(--tp-accent)]" />
      <span>Loading incident…</span>
    </div>

    <div v-else-if="error || !incident" class="px-4 py-16 text-center">
      <UIcon
        name="i-lucide-circle-alert"
        class="mx-auto size-8 text-[var(--feed-rail-critical)]"
      />
      <p class="mt-3 text-sm text-[var(--feed-rail-critical)]">Incident not found.</p>
      <NuxtLink to="/" class="mt-4 inline-block text-sm text-[var(--tp-accent)] hover:opacity-80">
        Back to feed
      </NuxtLink>
    </div>

    <template v-else>
      <IncidentHeader :incident="incident" />
      <div class="grid min-h-0 flex-1 lg:grid-cols-[1fr_16rem]">
        <div class="min-w-0">
          <IncidentSummary
            :summary="incident.aiSummary"
            :description="incident.description"
          />
          <IncidentTimeline
            :timeline="incident.timeline"
            :affected-versions="incident.affectedVersions"
            :indicators="incident.indicators"
          />
          <IncidentRelated
            v-if="incident.relatedIncidents?.length"
            :incidents="incident.relatedIncidents"
          />
        </div>
        <IncidentSidebar :incident="incident" />
      </div>
    </template>
  </div>
</template>
