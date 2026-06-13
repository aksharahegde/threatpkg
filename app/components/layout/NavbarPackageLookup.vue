<script setup lang="ts">
import type { Ecosystem } from '#shared/types/threat'
import { packagePagePath } from '#shared/utils/package-path'

const props = defineProps<{
  ecosystem?: Ecosystem
}>()

const query = ref('')
const pending = ref(false)
const error = ref<string | null>(null)

const isWide = useMediaQuery('(min-width: 640px)')
const placeholder = computed(() =>
  isWide.value
    ? 'search package (npm, laravel, flutter, …)…'
    : 'search package…'
)

async function lookup() {
  const name = query.value.trim()
  if (!name) return

  pending.value = true
  error.value = null

  try {
    const result = await $fetch<{
      packageName: string
      ecosystem: Ecosystem
    }>(`/api/packages/resolve/${encodeURIComponent(name)}`)

    const eco = props.ecosystem ?? result.ecosystem
    await navigateTo(packagePagePath(eco, result.packageName))
  } catch {
    error.value = 'Package not found'
  } finally {
    pending.value = false
  }
}

function onSubmit(e: Event) {
  e.preventDefault()
  lookup()
}
</script>

<template>
  <form
    class="flex min-w-0 flex-1 items-start gap-2"
    data-testid="layout-package-lookup"
    @submit="onSubmit"
  >
    <label class="tp-label hidden shrink-0 sm:inline sm:pt-2" for="pkg-lookup-input">
      PKG_LOOKUP:
    </label>
    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-center gap-2">
        <input
          id="pkg-lookup-input"
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="placeholder"
          class="font-tp-mono w-full min-w-0 rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface-inset)] px-3 py-1.5 text-base text-[var(--tp-text)] placeholder:text-[var(--tp-text-dim)] focus:border-[var(--tp-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--tp-accent)] sm:text-xs"
          data-testid="layout-package-lookup-input"
        />
        <button
          type="submit"
          class="tp-pill inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-sm p-0"
          :disabled="pending || !query.trim()"
          data-testid="layout-package-lookup-submit"
        >
          <UIcon
            v-if="pending"
            name="i-lucide-loader-circle"
            class="size-3.5 animate-spin"
          />
          <UIcon v-else name="i-lucide-search" class="size-3.5" />
        </button>
      </div>
      <p
        v-if="error"
        class="mt-0.5 font-tp-mono text-[10px] text-red-500"
      >
        {{ error }}
      </p>
    </div>
  </form>
</template>
