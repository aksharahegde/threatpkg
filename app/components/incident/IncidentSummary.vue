<script setup lang="ts">
import { extractIncidentSourceDigests } from '#shared/utils/incident-description'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{
  summary: string | null
  description: string
}>()

const parsedDescription = computed(() => extractIncidentSourceDigests(props.description))

const descriptionHtml = computed(() => renderMarkdown(parsedDescription.value.body))
</script>

<template>
  <section
    class="border-b border-[var(--tp-border)] px-4 py-5 sm:px-6"
    data-testid="incident-summary-section"
  >
    <div
      class="rounded-md border border-[var(--tp-border)] bg-[var(--tp-surface-raised)] p-4"
    >
      <h2 class="tp-label">AI summary</h2>
      <p class="mt-2 text-sm leading-relaxed text-[var(--tp-text-muted)]">
        {{ summary || 'Summary will be generated when AI enrichment is enabled.' }}
      </p>
    </div>
    <div class="mt-5">
      <h2 class="tp-label">Description</h2>
      <div class="incident-prose mt-2 text-sm leading-relaxed" v-html="descriptionHtml" />
    </div>
  </section>
</template>
