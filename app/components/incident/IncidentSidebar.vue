<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'
import { ecosystemCssClass } from '~/utils/ecosystem'

defineProps<{
  incident: FeedIncident
}>()
</script>

<template>
  <aside
    class="border-t border-[var(--tp-border)] bg-[var(--tp-surface)] lg:border-t-0 lg:border-l"
  >
    <div class="space-y-5 px-4 py-5 sm:px-5">
      <div>
        <p class="tp-label">Threat type</p>
        <p class="mt-1 text-sm capitalize text-[var(--tp-text)]">
          {{ incident.threatType.replace(/_/g, ' ') }}
        </p>
      </div>
      <div>
        <p class="tp-label">Source</p>
        <p class="mt-1 text-sm uppercase text-[var(--tp-text-muted)]">
          {{ incident.source }}
        </p>
      </div>
      <div>
        <p class="tp-label">Ecosystem</p>
        <p
          class="mt-1 text-sm uppercase"
          :class="ecosystemCssClass(incident.ecosystem)"
        >
          {{ incident.ecosystem }}
        </p>
      </div>
      <div v-if="incident.sourceUrl" data-testid="incident-sources-section">
        <p class="tp-label">Advisory</p>
        <a
          :href="incident.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--tp-accent)] transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tp-accent)]"
        >
          View {{ incident.source }} advisory
          <UIcon name="i-lucide-external-link" class="size-3.5" />
        </a>
      </div>
    </div>
  </aside>
</template>
