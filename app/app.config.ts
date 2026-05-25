export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      neutral: 'neutral'
    },
    select: {
      slots: {
        content: 'bg-[var(--tp-surface-raised)] ring-[var(--tp-border)]',
        item: 'text-[var(--tp-text)] data-highlighted:not-data-disabled:before:bg-[var(--tp-surface-inset)]'
      }
    }
  }
})
