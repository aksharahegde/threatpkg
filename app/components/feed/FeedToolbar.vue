<script setup lang="ts">
const props = defineProps<{
  pending?: boolean
  loadedCount?: number
  totalCount?: number
}>()

const resultLabel = computed(() => {
  const loaded = props.loadedCount
  if (loaded === undefined) return null
  const total = props.totalCount
  if (total !== undefined && total > loaded) {
    return `Showing ${loaded} of ${total} incidents`
  }
  return `${loaded} incident${loaded === 1 ? '' : 's'} loaded`
})

const emit = defineEmits<{
  refresh: []
}>()

const search = defineModel<string>('search', { default: '' })
const sort = defineModel<'published' | 'risk'>('sort', { default: 'published' })
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const selectUi = { base: 'bg-white ring-neutral-200 hover:bg-neutral-50' }
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 border-b border-[var(--feed-border)] bg-[var(--feed-surface-raised)] px-4 py-3"
    data-testid="feed-toolbar"
  >
    <div class="min-w-[220px] flex-1" data-testid="feed-search-input">
      <UInput
        v-model="search"
        placeholder="Package, CVE, or title…"
        size="sm"
        class="w-full"
        :ui="{
          base: 'bg-white ring-neutral-200 focus:ring-cyan-500/40'
        }"
      >
        <template #leading>
          <UIcon name="i-lucide-search" class="size-3.5 text-neutral-500" />
        </template>
      </UInput>
    </div>
    <div class="w-36" data-testid="feed-sort-select">
      <USelect
        v-model="sort"
        :items="[
          { label: 'Latest published', value: 'published' },
          { label: 'Highest risk', value: 'risk' }
        ]"
        size="sm"
        class="w-full"
        :ui="selectUi"
      />
    </div>
    <div data-testid="feed-refresh-button">
      <UButton
        size="sm"
        variant="outline"
        color="neutral"
        :loading="props.pending"
        @click="emit('refresh')"
      >
        <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
        Refresh
      </UButton>
    </div>
    <p
      v-if="mounted && resultLabel"
      class="w-full text-[11px] text-neutral-600 sm:ml-auto sm:w-auto"
    >
      {{ resultLabel }}
    </p>
  </div>
</template>
