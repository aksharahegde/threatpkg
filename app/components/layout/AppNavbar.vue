<script setup lang="ts">
import type { Ecosystem } from '#shared/types/threat'

const links: {
  label: string
  to: string
  icon: string
}[] = [
  { label: 'Feed', to: '/', icon: 'i-lucide-radar' },
  { label: 'Scan', to: '/scan', icon: 'i-lucide-shield-alert' },
  { label: 'Changelog', to: '/changelog', icon: 'i-lucide-scroll-text' },
  { label: 'About', to: '/about', icon: 'i-lucide-info' }
]

const lookupEcosystem = ref<Ecosystem | undefined>(undefined)

function setLookupEco(eco: Ecosystem | undefined) {
  lookupEcosystem.value = eco
}
</script>

<template>
  <header
    class="sticky top-0 z-50 shrink-0 border-b border-[var(--tp-border)] bg-[var(--tp-surface-raised)]/95 backdrop-blur-md"
    data-testid="layout-navbar"
  >
    <div
      class="grid gap-2 border-b border-[var(--tp-border)] px-3 py-2 sm:gap-3 sm:px-4 md:h-12 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center md:gap-3 md:py-0"
    >
      <NuxtLink
        to="/"
        class="col-start-1 row-start-1 inline-flex shrink-0 items-center gap-2 self-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tp-accent)]"
        data-testid="layout-brand-link"
      >
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-sm bg-[var(--tp-accent)] tp-glow-accent"
          aria-hidden="true"
        >
          <img
            src="/icon.png"
            alt=""
            class="size-5 brightness-0 invert"
            width="20"
            height="20"
            fetchpriority="high"
          />
        </span>
        <span
          class="hidden font-tp-mono text-sm font-bold tracking-widest text-[var(--tp-text)] sm:inline"
        >
          THREATPKG
        </span>
      </NuxtLink>

      <div
        class="col-start-2 row-start-1 flex items-center justify-end gap-2 self-center sm:gap-3 md:col-start-4"
      >
        <FeedFreshness />
        <LayoutSystemClock />
        <LayoutThemeToggle />
      </div>

      <div
        class="col-span-2 row-start-2 flex min-w-0 items-center gap-2 md:contents"
      >
        <LayoutNavbarPackageLookup
          class="min-w-0 flex-1 md:col-start-2 md:row-start-1 md:max-w-xl"
          :ecosystem="lookupEcosystem"
        />

        <div
          class="flex shrink-0 items-center gap-1 md:col-start-3 md:row-start-1"
          role="group"
          aria-label="Lookup ecosystem"
        >
          <button
            type="button"
            class="tp-pill rounded-sm px-2.5 py-1"
            :class="{ 'tp-pill--active': lookupEcosystem === 'npm' }"
            data-testid="layout-eco-npm"
            @click="setLookupEco(lookupEcosystem === 'npm' ? undefined : 'npm')"
          >
            NPM
          </button>
          <button
            type="button"
            class="tp-pill rounded-sm px-2.5 py-1"
            :class="{ 'tp-pill--active': lookupEcosystem === 'pypi' }"
            data-testid="layout-eco-pypi"
            @click="setLookupEco(lookupEcosystem === 'pypi' ? undefined : 'pypi')"
          >
            PYPI
          </button>
        </div>
      </div>
    </div>

    <nav
      class="nav-scroll-fade flex h-10 items-center gap-1 overflow-x-auto px-3 sm:h-9 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Main"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.label"
        :to="link.to"
        :aria-label="link.label"
        class="tp-pill inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-sm px-3 py-1.5 sm:min-h-0 sm:px-2.5 sm:py-1"
        active-class="tp-pill--active"
        data-testid="layout-nav-link"
      >
        <UIcon :name="link.icon" class="size-3.5 shrink-0 sm:size-3" />
        <span class="hidden sm:inline">{{ link.label }}</span>
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.nav-scroll-fade {
  mask-image: linear-gradient(
    to right,
    transparent,
    black 12px,
    black calc(100% - 12px),
    transparent
  );
}
</style>
