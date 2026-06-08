<script setup lang="ts">
import { ECOSYSTEM_META } from '#shared/constants/ecosystems'

definePageMeta({ layout: 'dashboard' })

const ecosystemHubs = ECOSYSTEM_META.map((eco) => ({
  ...eco,
  feedTo: { path: '/', query: { ecosystem: eco.id } } as const
}))

usePageSeo({
  title: 'About',
  description:
    'ThreatPkg is a public realtime dashboard for open-source package threat intelligence across npm, PyPI, Go, Rust, Java, .NET, RubyGems, Laravel/Composer, and Flutter.',
  ogTitle: 'About'
})

const dataSources = [
  {
    id: 'osv',
    name: 'OSV',
    description:
      'Open Source Vulnerabilities database (npm, PyPI, Go, crates.io, Maven, NuGet, RubyGems, Packagist, Pub).',
    url: 'https://osv.dev/'
  },
  {
    id: 'github',
    name: 'GitHub Advisory Database',
    description: 'Security advisories published through GitHub.',
    url: 'https://github.com/advisories'
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
          ThreatPkg is a public threat intelligence dashboard for npm, PyPI, Go,
          Rust (crates.io), Java (Maven), .NET (NuGet), RubyGems, PHP/Laravel
          (Packagist), and Dart/Flutter (pub.dev): compromised
          packages, malicious releases, and advisory identifiers
          (CVE, GHSA, OSV) in one searchable feed. Incidents are ingested on a
          regular schedule and attributed to the sources below.
        </p>
        <p>
          Use the threat feed to scan recent incidents, open a package to review
          reputation and history, or drill into an incident for full context.
          Content is aggregated from public advisories with outbound links to
          original publishers—not auto-generated landing pages for every keyword.
        </p>
      </div>

      <section
        class="tp-panel mt-10 rounded-sm px-5 py-5"
        aria-labelledby="about-ecosystems-heading"
        data-testid="about-ecosystems-section"
      >
        <h2 id="about-ecosystems-heading" class="tp-label">Ecosystems we track</h2>
        <p class="mt-3 text-sm leading-relaxed text-[var(--tp-text-muted)]">
          ThreatPkg normalizes supply-chain incidents across these registries in one
          feed. Each ecosystem uses OSV and GitHub advisory mappings where available;
          filter the live feed or open package reputation pages when a name appears
          in an incident.
        </p>
        <ul class="mt-5 space-y-4" role="list">
          <li
            v-for="eco in ecosystemHubs"
            :key="eco.id"
            class="border-b border-[var(--tp-border)] pb-4 last:border-0 last:pb-0"
            :data-testid="`about-ecosystem-${eco.id}`"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span :class="['tp-label', eco.cssClass]">{{ eco.label }}</span>
              <NuxtLink
                :to="eco.feedTo"
                class="text-sm text-[var(--tp-accent)] hover:opacity-80"
                :data-testid="`about-ecosystem-${eco.id}-feed`"
              >
                View feed
              </NuxtLink>
            </div>
            <p class="mt-1 text-sm text-[var(--tp-text-muted)]">
              <template v-if="eco.id === 'packagist'">
                PHP packages via Packagist—commonly used for Laravel and Composer
                dependencies. Incidents link to advisories and affected package names.
              </template>
              <template v-else-if="eco.id === 'pub'">
                Dart packages on pub.dev—used by Flutter apps. Track typosquats,
                compromised releases, and CVE/GHSA identifiers alongside other ecosystems.
              </template>
              <template v-else-if="eco.id === 'npm'">
                JavaScript and Node.js packages on the npm registry—the most common
                target for typosquats and postinstall malware in open source.
              </template>
              <template v-else-if="eco.id === 'pypi'">
                Python packages on PyPI, including wheels and sdists referenced in
                application and ML dependency trees.
              </template>
              <template v-else-if="eco.id === 'go'">
                Go modules identified by module path; useful for cloud-native and
                CLI supply-chain monitoring.
              </template>
              <template v-else-if="eco.id === 'crates'">
                Rust crates on crates.io with cargo ecosystem advisories from OSV and
                GitHub.
              </template>
              <template v-else-if="eco.id === 'maven'">
                Java and JVM artifacts published to Maven Central and compatible
                repositories.
              </template>
              <template v-else-if="eco.id === 'nuget'">
                .NET packages on NuGet for C#, F#, and other CLR ecosystems.
              </template>
              <template v-else>
                Ruby gems on RubyGems.org with linked GHSA/OSV records where published.
              </template>
            </p>
          </li>
        </ul>
      </section>

      <section
        class="tp-panel mt-10 rounded-sm px-5 py-5"
        aria-labelledby="about-sources-heading"
        data-testid="about-sources-section"
      >
        <h2 id="about-sources-heading" class="tp-label">Data sources & credits</h2>
        <p class="mt-3 text-sm leading-relaxed text-[var(--tp-text-muted)]">
          ThreatPkg aggregates public advisories. Advisory
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
