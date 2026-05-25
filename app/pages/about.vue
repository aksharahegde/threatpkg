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
          (CVE, GHSA, OSV) in one searchable feed. Data syncs from OSV, GitHub
          Advisories, and security research blogs on a regular schedule.
        </p>
        <p>
          Use the threat feed to scan recent incidents, open a package to review
          reputation and history, or drill into an incident for full context.
        </p>
      </div>

      <section
        class="mt-10 rounded-lg border border-[var(--feed-border)] bg-[var(--feed-surface-raised)] px-5 py-5"
        aria-labelledby="about-author-heading"
      >
        <h2
          id="about-author-heading"
          class="tp-label"
        >
          Author
        </h2>
        <p class="mt-3 text-sm text-neutral-700">
          Built by
          <a
            href="https://akshara.dev"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-cyan-700 underline decoration-cyan-700/30 underline-offset-2 transition hover:text-cyan-800 hover:decoration-cyan-800"
            data-testid="about-author-link"
          >
            Akshara Hegde
          </a>
        </p>
      </section>
    </main>
  </div>
</template>
