<script setup lang="ts">
const {
  packageName = 'example-pkg',
  ecosystemLabel = 'NPM',
  riskScore = 0,
  incidentCount = 0,
  siteName = 'ThreatPkg'
} = defineProps<{
  packageName?: string
  ecosystemLabel?: string
  riskScore?: number
  incidentCount?: number
  siteName?: string
}>()

/** Intentional line breaks so OG renderer does not wrap mid-token. */
function packageNameLines(name: string): string[] {
  const maxSingleLine = 22
  if (name.length <= maxSingleLine) return [name]

  const slash = name.indexOf('/')
  if (slash > 0 && slash < name.length - 1) {
    return [name.slice(0, slash + 1), name.slice(slash + 1)]
  }

  const hyphen = name.indexOf('-')
  if (hyphen > 0 && hyphen < name.length - 1) {
    return [name.slice(0, hyphen + 1), name.slice(hyphen + 1)]
  }

  const mid = Math.ceil(name.length / 2)
  return [name.slice(0, mid), name.slice(mid)]
}

const titleLines = computed(() => packageNameLines(packageName))
const titleSizeClass = computed(() => {
  const n = titleLines.value.length
  if (n >= 3) return 'text-5xl'
  if (n === 2) return 'text-6xl'
  return 'text-7xl'
})
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
        {{ ecosystemLabel }} · Package reputation
      </p>
      <h1
        :class="['mt-8 font-bold leading-[1.1] text-[#f4f4f5]', titleSizeClass]"
        style="font-family: ui-monospace, monospace"
      >
        <span
          v-for="(line, index) in titleLines"
          :key="index"
          class="block"
        >{{ line }}</span>
      </h1>
    </div>
    <div class="flex items-end justify-between border-t border-[#2a2a30] pt-10">
      <div>
        <p class="text-lg uppercase tracking-wide text-[#71717a]">Risk score</p>
        <p
          class="text-8xl font-bold tabular-nums text-[#ff8c00]"
          style="font-family: ui-monospace, monospace"
        >
          {{ riskScore }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-lg uppercase tracking-wide text-[#71717a]">Incidents</p>
        <p
          class="text-6xl font-bold tabular-nums text-[#f4f4f5]"
          style="font-family: ui-monospace, monospace"
        >
          {{ incidentCount }}
        </p>
      </div>
    </div>
  </div>
</template>
