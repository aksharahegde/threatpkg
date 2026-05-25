<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

useSeoMeta({
  title: 'About',
  description:
    'ThreatPkg is a public realtime dashboard for open-source package threat intelligence across npm and PyPI.',
  ogTitle: 'About · ThreatPkg',
  ogDescription:
    'ThreatPkg is a public realtime dashboard for open-source package threat intelligence across npm and PyPI.'
})

const dataSources = [
  {
    id: 'osv',
    name: 'OSV',
    description: 'Open Source Vulnerabilities database (npm and PyPI advisories).',
    url: 'https://osv.dev/'
  },
  {
    id: 'github',
    name: 'GitHub Advisory Database',
    description: 'Security advisories published through GitHub.',
    url: 'https://github.com/advisories'
  },
  {
    id: 'snyk',
    name: 'Snyk Blog',
    description: 'Security research and supply-chain reporting.',
    url: 'https://snyk.io/blog/'
  },
  {
    id: 'socket',
    name: 'Socket',
    description: 'Open-source supply-chain security research.',
    url: 'https://socket.dev/'
  },
  {
    id: 'phylum',
    name: 'Phylum',
    description: 'Package ecosystem threat research and analysis.',
    url: 'https://phylum.io/'
  },
  {
    id: 'jfrog',
    name: 'JFrog Security Research',
    description: 'Malware and dependency threat intelligence.',
    url: 'https://research.jfrog.com/'
  }
] as const
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-[var(--tp-surface)]">
    <LayoutAppHeader
      title="About ThreatPkg"
      subtitle="Open-source package threat intelligence"
    />

    <main class="mx-auto w-full max-w-2xl px-4 py-8">
      <div class="space-y-6 text-sm leading-relaxed text-[var(--tp-text-muted)]">
        <p>
          ThreatPkg is a public threat intelligence dashboard for npm and PyPI:
          compromised packages, malicious releases, and advisory identifiers
          (CVE, GHSA, OSV) in one searchable feed. Incidents are ingested on a
          regular schedule and attributed to the sources below.
        </p>
        <p>
          Use the threat feed to scan recent incidents, open a package to review
          reputation and history, or drill into an incident for full context.
        </p>
      </div>

      <section
        class="tp-panel mt-10 rounded-sm px-5 py-5"
        aria-labelledby="about-sources-heading"
        data-testid="about-sources-section"
      >
        <h2 id="about-sources-heading" class="tp-label">Data sources & credits</h2>
        <p class="mt-3 text-sm leading-relaxed text-[var(--tp-text-muted)]">
          ThreatPkg aggregates public advisories and research feeds. Advisory
          text, identifiers, and severity ratings belong to the original
          publishers. Links below point to each provider.
        </p>
        <ul class="mt-5 space-y-4" role="list">
          <li
            v-for="source in dataSources"
            :key="source.id"
            class="border-b border-[var(--tp-border)] pb-4 last:border-0 last:pb-0"
            :data-testid="`about-source-${source.id}`"
          >
            <a
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 font-medium text-[var(--tp-text)] transition hover:text-[var(--tp-accent)]"
            >
              {{ source.name }}
              <UIcon name="i-lucide-external-link" class="size-3.5 shrink-0" />
            </a>
            <p class="mt-1 text-sm text-[var(--tp-text-muted)]">
              {{ source.description }}
            </p>
          </li>
        </ul>
      </section>

      <section
        class="tp-panel mt-8 rounded-sm px-5 py-5"
        aria-labelledby="about-author-heading"
      >
        <h2 id="about-author-heading" class="tp-label">About me</h2>
        <p class="mt-3 text-sm text-[var(--tp-text-muted)]">
          Built by
          <a
            href="https://akshara.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-[var(--tp-accent)] underline decoration-[var(--tp-accent)]/30 underline-offset-2 transition hover:opacity-80"
            data-testid="about-author-link"
          >
            Akshara Hegde
          </a>
          .
        </p>
      </section>
    </main>
  </div>
</template>
