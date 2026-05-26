<script setup lang="ts">
import { defineBreadcrumb, useSchemaOrg } from '#imports'
import { absoluteSiteUrl } from '#shared/utils/seo'
import type { MaybeRefOrGetter } from 'vue'
import { toValue, computed } from 'vue'

export interface PageBreadcrumbItem {
  label: string
  to?: string
  current?: boolean
  labelClass?: string
}

const props = defineProps<{
  items?: MaybeRefOrGetter<PageBreadcrumbItem[]>
  prepend?: MaybeRefOrGetter<PageBreadcrumbItem[]>
  append?: MaybeRefOrGetter<PageBreadcrumbItem[]>
}>()

const items = computed(() => {
  if (props.items) return toValue(props.items) ?? []
  return [
    ...(toValue(props.prepend) ?? []),
    ...(toValue(props.append) ?? [])
  ]
})

const site = useSiteConfig()

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: computed(() =>
      items.value
        .filter((item): item is PageBreadcrumbItem & { to: string } => !!item.to)
        .map((item) => ({
          name: item.label,
          item: absoluteSiteUrl(item.to, site.url)
        }))
    )
  })
])
</script>

<template>
  <nav
    v-if="items.length"
    class="flex flex-wrap items-center gap-2 border-b border-[var(--tp-border)] bg-[var(--tp-surface-raised)] px-4 py-2 text-sm"
    aria-label="Breadcrumb"
  >
    <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
      <span
        v-if="index > 0"
        class="text-[var(--tp-text-dim)]"
        aria-hidden="true"
      >
        /
      </span>
      <NuxtLink
        v-if="item.to && !item.current"
        :to="item.to"
        class="hover:text-[var(--tp-accent)]"
        :class="item.labelClass"
      >
        {{ item.label }}
      </NuxtLink>
      <span
        v-else
        class="text-[var(--tp-text)]"
        :class="item.labelClass"
        :aria-current="item.current ? item.ariaCurrent ?? 'page' : undefined"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
