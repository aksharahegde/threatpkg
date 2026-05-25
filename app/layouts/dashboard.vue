<template>
  <div class="flex min-h-screen flex-col bg-[var(--tp-bg)]">
    <LayoutAppNavbar />
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <slot />
    </div>
  </div>
</template>
