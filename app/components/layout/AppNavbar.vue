<script setup lang="ts">
import type { Ecosystem } from '#shared/types/threat'

const links: {
  label: string
  to: string
  icon: string
}[] = [
  { label: 'Feed', to: '/', icon: 'i-lucide-radar' },
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
      class="flex h-12 items-center gap-3 border-b border-[var(--tp-border)] px-3 sm:gap-4 sm:px-4"
    >
      <NuxtLink
        to="/"
        class="inline-flex shrink-0 items-center gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tp-accent)]"
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
          class="font-tp-mono text-sm font-bold tracking-widest text-[var(--tp-text)]"
        >
          THREATPKG
        </span>
      </NuxtLink>

      <LayoutNavbarPackageLookup
        class="mx-1 max-w-xl"
        :ecosystem="lookupEcosystem"
      />

      <div
        class="flex shrink-0 items-center gap-1"
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

      <div class="ms-auto flex items-center gap-2 sm:gap-3">
        <FeedFreshness />
        <LayoutSystemClock />
        <LayoutThemeToggle />
      </div>
    </div>

    <nav
      class="flex h-9 items-center gap-1 px-3 sm:px-4"
      aria-label="Main"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.label"
        :to="link.to"
        class="tp-pill inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1"
        active-class="tp-pill--active"
        data-testid="layout-nav-link"
      >
        <UIcon :name="link.icon" class="size-3 shrink-0" />
        {{ link.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
