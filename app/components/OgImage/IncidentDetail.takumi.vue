<script setup lang="ts">
const {
  title = 'Supply-chain incident',
  packageName = 'example-pkg',
  ecosystemLabel = 'NPM',
  severity = 'HIGH',
  siteName = 'ThreatPkg'
} = defineProps<{
  title?: string
  packageName?: string
  ecosystemLabel?: string
  severity?: string
  siteName?: string
}>()

const severityColor = computed(() => {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return '#ef4444'
    case 'HIGH':
      return '#f97316'
    case 'MEDIUM':
      return '#eab308'
    case 'LOW':
      return '#22c55e'
    default:
      return '#71717a'
  }
})

function truncateTitle(value: string, max = 72): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}
</script>

<template>
  <div
    class="flex h-full w-full flex-col justify-between bg-[#0a0a0c] p-16 text-[#f4f4f5]"
    style="font-family: ui-sans-serif, system-ui, sans-serif"
  >
    <div>
      <p class="text-2xl font-semibold uppercase tracking-widest text-[#ff8c00]">
        {{ siteName }}
      </p>
      <p class="mt-3 text-xl uppercase tracking-wide text-[#71717a]">
        {{ ecosystemLabel }} · Incident detail
      </p>
      <p
        class="mt-6 font-mono text-3xl font-medium text-[#a1a1aa]"
        style="font-family: ui-monospace, monospace"
      >
        {{ packageName }}
      </p>
      <h1 class="mt-6 text-5xl font-bold leading-[1.15] text-[#f4f4f5]">
        {{ truncateTitle(title) }}
      </h1>
    </div>
    <div class="flex items-end justify-between border-t border-[#2a2a30] pt-10">
      <div>
        <p class="text-lg uppercase tracking-wide text-[#71717a]">Severity</p>
        <p
          class="text-6xl font-bold uppercase tracking-wide"
          :style="{ color: severityColor }"
        >
          {{ severity }}
        </p>
      </div>
      <p class="text-right text-2xl text-[#71717a]">Supply-chain threat intelligence</p>
    </div>
  </div>
</template>
