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
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    optimizeDeps: {
      include: ['isomorphic-dompurify', 'marked']
    }
  },

  modules: ['@nuxt/ui', '@vueuse/nuxt', '@nuxtjs/seo'],

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
      title: 'ThreatPkg',
      titleTemplate: '%s · ThreatPkg',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        {
          name: 'description',
          content:
            'Public realtime dashboard for open-source package threat intelligence: compromised npm, PyPI, Go, Rust, Java, .NET, Ruby, PHP/Laravel, and Flutter packages.'
        },
        {
          name: 'keywords',
          content:
            'npm security, PyPI, Laravel, Composer, Flutter, pub.dev, Go, Rust, Maven, NuGet, RubyGems, supply chain attack, CVE, malware packages'
        },
        { name: 'author', content: 'ThreatPkg' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#0a0a0c', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#fafbfc', media: '(prefers-color-scheme: light)' },
        { name: 'application-name', content: 'ThreatPkg' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'ThreatPkg' },
        { name: 'twitter:card', content: 'summary_large_image' }
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
    defaultLocale: 'en'
  },

  sitemap: { enabled: true },
  robots: { enabled: true }
})
