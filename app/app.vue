<script setup lang="ts">
const colorMode = useColorMode()

useHead({
  meta: [
    {
      name: 'theme-color',
      content: computed(() =>
        colorMode.value === 'dark' ? '#0a0a0c' : '#fafbfc'
      )
    }
  ]
})

useSeoMeta({
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
