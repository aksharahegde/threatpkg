<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  testid?: string
}>()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}

onBeforeUnmount(() => {
  clearTimeout(resetTimer)
})
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <span class="min-w-0 truncate text-sm text-[var(--tp-text-muted)]">{{ label }}</span>
    <button
      type="button"
      class="tp-pill shrink-0 rounded-sm px-2 py-1 font-tp-mono text-[10px]"
      :data-testid="testid ?? 'incident-digest-copy'"
      @click="copy"
    >
      <UIcon
        :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        class="me-1 inline size-3"
      />
      {{ copied ? 'Copied' : 'Copy' }}
    </button>
  </div>
</template>
