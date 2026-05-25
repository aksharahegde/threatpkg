<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <header
    class="border-b border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-3"
    data-testid="layout-header"
  >
    <p v-if="subtitle" class="tp-label">
      {{ subtitle }}
    </p>
    <h1
      v-if="title"
      class="mt-0.5 text-lg font-semibold tracking-tight text-[var(--tp-text)]"
    >
      {{ title }}
    </h1>
  </header>
</template>
