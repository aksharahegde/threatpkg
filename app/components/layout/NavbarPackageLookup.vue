<script setup lang="ts">
import type { Ecosystem } from '#shared/types/threat'
import { packagePagePath } from '#shared/utils/package-path'

const props = defineProps<{
  ecosystem?: Ecosystem
}>()

const query = ref('')
const pending = ref(false)
const error = ref<string | null>(null)

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
    class="flex min-w-0 flex-1 items-center gap-2"
    data-testid="layout-package-lookup"
    @submit="onSubmit"
  >
    <label class="tp-label hidden shrink-0 sm:inline" for="pkg-lookup-input">
      PKG_LOOKUP:
    </label>
    <div class="relative min-w-0 flex-1">
      <input
        id="pkg-lookup-input"
        v-model="query"
        type="search"
        autocomplete="off"
        placeholder="search package (npm, laravel, flutter, …)…"
        class="font-tp-mono w-full rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface-inset)] px-3 py-1.5 text-xs text-[var(--tp-text)] placeholder:text-[var(--tp-text-dim)] focus:border-[var(--tp-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--tp-accent)]"
        data-testid="layout-package-lookup-input"
      />
      <p
        v-if="error"
        class="absolute top-full mt-0.5 font-tp-mono text-[10px] text-red-500"
      >
        {{ error }}
      </p>
    </div>
    <button
      type="submit"
      class="tp-pill shrink-0 rounded-sm px-2.5 py-1.5"
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
  </form>
</template>
