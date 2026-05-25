import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

/**
 * Page-level SEO via @nuxtjs/seo (nuxt-seo-utils).
 * Canonical URL and og:url are applied automatically from the current route.
 *
 * @see https://nuxtseo.com/docs/nuxt-seo/getting-started/usage
 */
export function usePageSeo(input: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  ogTitle?: MaybeRefOrGetter<string>
}) {
  const site = useSiteConfig()

  useSeoMeta({
    title: input.title,
    description: input.description,
    ogTitle: () => {
      const custom = input.ogTitle ? toValue(input.ogTitle) : toValue(input.title)
      return custom.includes(site.name) ? custom : `${custom} · ${site.name}`
    },
    ogDescription: input.description,
    twitterTitle: input.ogTitle ?? input.title,
    twitterDescription: input.description
  })
}
