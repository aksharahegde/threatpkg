import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '#shared': join(rootDir, 'shared')
  },

  nitro: {
    alias: {
      '#shared': join(rootDir, 'shared')
    },
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      '*/30 * * * *': ['sync-all']
    }
  },

  routeRules: {
    '/api/cron/sync': { maxDuration: 300 }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    optimizeDeps: {
      include: ['marked', 'sanitize-html']
    }
  },

  modules: ['@nuxt/ui', '@vueuse/nuxt', '@nuxtjs/seo'],

  /** @see https://nuxtseo.com/docs/nuxt-seo/getting-started/installation */
  seo: {
    metaDataFiles: true,
    automaticOgAndTwitterTags: true,
    fallbackTitle: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'threatpkg-color-mode'
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        {
          name: 'keywords',
          content:
            'npm security, PyPI, Laravel, Composer, Flutter, pub.dev, Go, Rust, Maven, NuGet, RubyGems, supply chain attack, CVE, malware packages'
        },
        { name: 'author', content: 'ThreatPkg' },
        { name: 'theme-color', content: '#0a0a0c', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#fafbfc', media: '(prefers-color-scheme: light)' },
        { name: 'application-name', content: 'ThreatPkg' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap'
        }
      ],
      bodyAttrs: {
        class: 'antialiased min-h-screen'
      }
    }
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    redisUrl: process.env.REDIS_URL || '',
    githubToken: process.env.GITHUB_TOKEN || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'ThreatPkg',
    description:
      'Public realtime dashboard for open-source package threat intelligence across npm, PyPI, Go, Rust, Java, .NET, RubyGems, Packagist, and Pub.',
    defaultLocale: 'en',
    trailingSlash: false
  },

  sitemap: {
    enabled: true,
    cacheMaxAgeSeconds: 3600,
    sources: ['/__sitemap__/urls']
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'ThreatPkg',
      url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      logo: '/icon.png',
      description:
        'Public realtime dashboard for open-source package threat intelligence across npm, PyPI, Go, Rust, Java, .NET, RubyGems, Packagist, and Pub.'
    }
  },

  robots: { enabled: true }
})
