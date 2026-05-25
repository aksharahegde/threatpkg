<script setup lang="ts">
import { packagePagePath } from '#shared/utils/package-path'

const route = useRoute()
const name = decodeURIComponent(route.params.name as string)

const { data, error } = await useFetch<{ ecosystem: 'npm' | 'pypi' }>(
  () => `/api/packages/resolve/${encodeURIComponent(name)}`
)

if (error.value || !data.value?.ecosystem) {
  throw createError({ statusCode: 404, statusMessage: 'Package not found' })
}

await navigateTo(packagePagePath(data.value.ecosystem, name), { replace: true })
</script>

<template>
  <div class="px-4 py-8 text-neutral-500">Redirecting…</div>
</template>
