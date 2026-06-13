<script setup lang="ts">
import { renderMarkdown } from '~/utils/markdown'
import versionRaw from '../../VERSION?raw'

definePageMeta({ layout: 'dashboard' })

usePageSeo({
  title: 'Changelog',
  description:
    'Release history for ThreatPkg — dependency scanning, package threat intelligence, and incident tracking updates.',
  ogTitle: 'Changelog'
})

const currentVersion = versionRaw.trim()

const { releases, pending, error } = useChangelog()

const GITHUB_RELEASES_BASE = 'https://github.com/aksharahegde/threatpkg/releases/tag'

function formatReleaseDate(date: string | null): string {
  if (!date) return 'In progress'
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

function releaseTag(version: string): string {
  return version === 'Unreleased' ? '' : `v${version}`
}

function releaseUrl(version: string): string | null {
  const tag = releaseTag(version)
  return tag ? `${GITHUB_RELEASES_BASE}/${tag}` : null
}

function releaseBodyHtml(body: string): string {
  return body ? renderMarkdown(body) : ''
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-[var(--tp-surface)]">
    <LayoutAppHeader
      title="Changelog"
      :subtitle="`Release history · current version ${currentVersion}`"
    />

    <main class="mx-auto w-full max-w-2xl px-4 py-8">
      <p class="text-sm leading-relaxed text-[var(--tp-text-muted)]">
        Notable changes to ThreatPkg by version. Each release links to its GitHub
        tag when published.
      </p>

      <p v-if="pending" class="mt-6 font-tp-mono text-xs text-[var(--tp-text-muted)]">
        Loading releases…
      </p>

      <p v-else-if="error" class="mt-6 font-tp-mono text-xs text-red-500">
        Could not load changelog.
      </p>

      <p
        v-else-if="releases.length === 0"
        class="mt-6 text-sm text-[var(--tp-text-muted)]"
      >
        No releases documented yet.
      </p>

      <section
        v-else
        class="mt-8 space-y-6"
        aria-labelledby="changelog-releases-heading"
        data-testid="changelog-releases-section"
      >
        <h2 id="changelog-releases-heading" class="sr-only">Releases</h2>

        <article
          v-for="release in releases"
          :key="release.version"
          class="tp-panel rounded-sm px-5 py-5"
          :data-testid="`changelog-row-${release.version}`"
        >
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="tp-label">
              {{ release.version === 'Unreleased' ? 'Unreleased' : `v${release.version}` }}
            </h3>
            <span class="text-xs text-[var(--tp-text-muted)]">
              {{ formatReleaseDate(release.date) }}
            </span>
            <a
              v-if="releaseUrl(release.version)"
              :href="releaseUrl(release.version)!"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs text-[var(--tp-accent)] hover:opacity-80"
            >
              GitHub release
              <UIcon name="i-lucide-external-link" class="size-3 shrink-0" />
            </a>
          </div>

          <div
            v-if="release.body"
            class="changelog-body mt-4 text-sm leading-relaxed text-[var(--tp-text-muted)]"
            v-html="releaseBodyHtml(release.body)"
          />
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.changelog-body :deep(h3) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--tp-text);
}

.changelog-body :deep(h3:first-child) {
  margin-top: 0;
}

.changelog-body :deep(ul) {
  margin-top: 0.25rem;
  padding-left: 1.25rem;
  list-style-type: disc;
}

.changelog-body :deep(li + li) {
  margin-top: 0.25rem;
}

.changelog-body :deep(a) {
  color: var(--tp-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
