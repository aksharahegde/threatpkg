<script setup lang="ts">
const utcTime = ref('')

function tick() {
  const now = new Date()
  utcTime.value = now.toISOString().slice(11, 19) + ' UTC'
}

onMounted(() => {
  tick()
  const id = setInterval(tick, 1000)
  onUnmounted(() => clearInterval(id))
})
</script>

<template>
  <span
    class="font-tp-mono hidden text-[10px] tabular-nums text-[var(--tp-text-dim)] lg:inline"
    data-testid="layout-system-clock"
  >
    {{ utcTime }}
  </span>
</template>
