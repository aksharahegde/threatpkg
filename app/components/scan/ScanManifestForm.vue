<script setup lang="ts">
import type { DependencyFileInput } from '#shared/types/scan'

const emit = defineEmits<{
  submit: [files: DependencyFileInput[]]
}>()

const props = defineProps<{
  pending?: boolean
}>()

const files = ref<DependencyFileInput[]>([])
const pasteName = ref('requirements.txt')
const pasteContent = ref('')
const error = ref<string | null>(null)

const ACCEPTED = '.json,.lock,.txt'

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const list = input.files
  if (!list?.length) return

  error.value = null
  const next = [...files.value]

  for (const file of Array.from(list)) {
    if (next.length >= 5) {
      error.value = 'Maximum 5 files'
      break
    }
    const content = await file.text()
    next.push({ filename: file.name, content })
  }

  files.value = next
  input.value = ''
}

function addPaste() {
  const content = pasteContent.value.trim()
  if (!content) return
  if (files.value.length >= 5) {
    error.value = 'Maximum 5 files'
    return
  }
  error.value = null
  files.value = [
    ...files.value,
    { filename: pasteName.value.trim() || 'requirements.txt', content }
  ]
  pasteContent.value = ''
}

function removeFile(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
}

function onSubmit(e: Event) {
  e.preventDefault()
  if (!files.value.length) {
    error.value = 'Add at least one file'
    return
  }
  emit('submit', files.value)
}
</script>

<template>
  <form
    class="tp-panel space-y-4 rounded-sm p-4"
    data-testid="scan-manifest-submit"
    @submit="onSubmit"
  >
    <div data-testid="scan-manifest-upload">
      <label class="tp-label block" for="scan-file-input">Upload manifests</label>
      <p class="mt-1 text-xs text-[var(--tp-text-dim)]">
        package-lock.json, yarn.lock, bun.lock, package.json, poetry.lock, or requirements.txt (max 5 files)
      </p>
      <input
        id="scan-file-input"
        type="file"
        multiple
        :accept="ACCEPTED"
        class="mt-2 block w-full font-tp-mono text-xs text-[var(--tp-text-muted)] file:mr-3 file:rounded-sm file:border file:border-[var(--tp-border)] file:bg-[var(--tp-surface-inset)] file:px-3 file:py-1.5 file:text-xs file:text-[var(--tp-text)]"
        :disabled="props.pending"
        @change="onFileChange"
      />
    </div>

    <div class="border-t border-[var(--tp-border)] pt-4">
      <label class="tp-label block" for="scan-paste-name">Or paste content</label>
      <div class="mt-2 flex flex-wrap gap-2">
        <select
          id="scan-paste-name"
          v-model="pasteName"
          class="font-tp-mono rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface-inset)] px-2 py-1.5 text-xs text-[var(--tp-text)]"
          :disabled="props.pending"
        >
          <option value="requirements.txt">requirements.txt</option>
          <option value="package.json">package.json</option>
          <option value="package-lock.json">package-lock.json</option>
          <option value="yarn.lock">yarn.lock</option>
          <option value="bun.lock">bun.lock</option>
          <option value="poetry.lock">poetry.lock</option>
        </select>
        <button
          type="button"
          class="tp-pill rounded-sm px-3 py-1.5 text-xs"
          :disabled="props.pending || !pasteContent.trim()"
          @click="addPaste"
        >
          Add to scan
        </button>
      </div>
      <textarea
        v-model="pasteContent"
        rows="6"
        placeholder="Paste file contents…"
        class="font-tp-mono mt-2 w-full rounded-sm border border-[var(--tp-border)] bg-[var(--tp-surface-inset)] px-3 py-2 text-xs text-[var(--tp-text)] placeholder:text-[var(--tp-text-dim)] focus:border-[var(--tp-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--tp-accent)]"
        :disabled="props.pending"
      />
    </div>

    <ul v-if="files.length" class="space-y-1" role="list">
      <li
        v-for="(file, index) in files"
        :key="`${file.filename}-${index}`"
        class="flex items-center justify-between gap-2 font-tp-mono text-xs text-[var(--tp-text-muted)]"
      >
        <span>{{ file.filename }} ({{ file.content.length }} chars)</span>
        <button
          type="button"
          class="text-[var(--tp-accent)] hover:opacity-80"
          :disabled="props.pending"
          @click="removeFile(index)"
        >
          Remove
        </button>
      </li>
    </ul>

    <p v-if="error" class="font-tp-mono text-xs text-red-500">{{ error }}</p>

    <button
      type="submit"
      class="tp-pill tp-pill--active rounded-sm px-4 py-2 text-xs font-medium"
      :disabled="props.pending || !files.length"
    >
      <UIcon
        v-if="props.pending"
        name="i-lucide-loader-circle"
        class="mr-1.5 inline size-3.5 animate-spin"
      />
      Scan dependencies
    </button>
  </form>
</template>
