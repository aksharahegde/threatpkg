<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const id = computed(() => route.params.id as string)
const { data: incident, pending, error } = useIncident(id)

const showLoading = computed(
  () => pending.value || (!incident.value && !error.value && import.meta.server)
)

useSeoMeta({
  title: () => incident.value?.title ?? 'Incident',
  description: () =>
    incident.value?.description?.slice(0, 160) ??
    'Supply-chain incident detail from the ThreatPkg threat intelligence feed.',
  ogTitle: () =>
    incident.value?.title
      ? `${incident.value.title} · ThreatPkg`
      : 'Incident · ThreatPkg',
  ogDescription: () =>
    incident.value?.description?.slice(0, 160) ??
    'Supply-chain incident detail from the ThreatPkg threat intelligence feed.'
})
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-[var(--tp-surface)]">
    <LayoutAppHeader
      title="Incident detail"
      subtitle="Supply-chain threat intelligence"
    />

    <nav
      class="flex items-center gap-2 border-b border-[var(--tp-border)] bg-[var(--tp-surface-raised)] px-4 py-2 text-sm"
      aria-label="Breadcrumb"
    >
      <NuxtLink
        to="/"
        class="tp-pill inline-flex items-center gap-1 border-0 px-0 py-0 hover:text-[var(--tp-accent)]"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        Threat feed
      </NuxtLink>
    </nav>

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
