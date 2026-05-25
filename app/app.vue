<script setup lang="ts">
const site = useSiteConfig()
const colorMode = useColorMode()

const absoluteOgImage = computed(() => new URL('/logo.png', site.url).href)

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

/** Global OG/Twitter defaults from nuxt-site-config + nuxt-seo-utils */
useSeoMeta({
  twitterCard: 'summary_large_image',
  ogImage: absoluteOgImage,
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
