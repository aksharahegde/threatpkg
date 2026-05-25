<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="tp-pill inline-flex size-8 items-center justify-center rounded-sm p-0"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    data-testid="layout-theme-toggle"
    @click="toggle"
  >
    <UIcon
      :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
      class="size-3.5"
    />
  </button>
</template>
