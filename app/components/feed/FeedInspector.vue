<script setup lang="ts">
import type { FeedIncident } from '#shared/types/threat'
import { packagePagePath } from '#shared/utils/package-path'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{
  item: FeedIncident | null
}>()

const descriptionHtml = computed(() => {
  const text = props.item?.description || props.item?.title
  return text ? renderMarkdown(text) : ''
})

const severityClass = computed(() => {
  const s = props.item?.severity
  if (s === 'critical') return 'text-[var(--feed-rail-critical)]'
  if (s === 'high') return 'text-[var(--feed-rail-high)]'
  if (s === 'medium') return 'text-[var(--feed-rail-medium)]'
  return 'text-[var(--tp-text-muted)]'
})

const remediation = computed(() => {
  const item = props.item
  if (!item) return []
  if (item.ecosystem === 'pypi') {
    return [
      `$ pip uninstall ${item.packageName}`,
      `$ pip install ${item.packageName}  # pin safe version`
    ]
  }
  return [
    `$ npm uninstall ${item.packageName}`,
    `$ npm install ${item.packageName}@latest  # pin safe version`
  ]
})
</script>

<template>
  <section
    class="tp-panel flex min-w-0 flex-col rounded-sm p-4"
    data-testid="feed-inspector"
  >
    <h2 class="tp-label">INSPECTOR</h2>

    <div v-if="!item" class="mt-6 text-center text-xs text-[var(--tp-text-dim)]">
      Select a threat from the feed
    </div>

    <template v-else>
      <div class="mt-4">
        <NuxtLink
          :to="packagePagePath(item.ecosystem, item.packageName)"
          class="font-tp-mono text-xl font-semibold text-[var(--tp-text)] hover:text-[var(--tp-accent)]"
          data-testid="feed-package-link"
        >
          {{ item.packageName }}
        </NuxtLink>
        <div class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p class="tp-label">Severity</p>
            <p
              class="font-tp-mono mt-0.5 text-sm font-semibold uppercase"
              :class="severityClass"
            >
              {{ item.severity }}
            </p>
          </div>
          <div>
            <p class="tp-label">Ecosystem</p>
            <p
              class="font-tp-mono mt-0.5 text-sm font-semibold uppercase"
              :class="item.ecosystem === 'npm' ? 'tp-eco-npm' : 'tp-eco-pypi'"
            >
              {{ item.ecosystem }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="inspector-prose incident-prose mt-4 min-w-0 text-xs leading-relaxed"
        v-html="descriptionHtml"
      />

      <div class="mt-4">
        <p class="tp-label mb-2">Remediation</p>
        <pre
          class="font-tp-mono overflow-hidden rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface-inset)] p-3 text-[10px] leading-relaxed whitespace-pre-wrap break-all text-[var(--tp-text-muted)]"
        ><code v-for="(line, i) in remediation" :key="i">{{ line }}
</code></pre>
      </div>

      <div class="mt-auto pt-4" data-testid="feed-incident-link">
        <NuxtLink
          :to="`/incident/${item.id}`"
          class="flex w-full items-center justify-center rounded-sm bg-[var(--tp-text)] px-4 py-2.5 font-tp-mono text-xs font-semibold uppercase tracking-wider text-[var(--tp-bg)] transition hover:opacity-90"
        >
          View full advisory
        </NuxtLink>
      </div>
    </template>
  </section>
</template>
