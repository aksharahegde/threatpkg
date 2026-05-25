<script setup lang="ts">
const site = useSiteConfig()
const siteUrl = useRuntimeConfig().public.siteUrl
const colorMode = useColorMode()

const absoluteOgImage = computed(() => new URL('/logo.png', siteUrl).href)

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
  ogTitle: () => site.name,
  ogDescription: () => site.description,
  ogImage: absoluteOgImage,
  ogUrl: () => site.url,
  twitterTitle: () => site.name,
  twitterDescription: () => site.description,
  twitterImage: absoluteOgImage
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
