import type { DependencyFileInput, ScanResponse } from '#shared/types/scan'

export function useDependencyScan() {
  const files = ref<DependencyFileInput[]>([])
  const response = ref<ScanResponse | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  function addFiles(newFiles: DependencyFileInput[]) {
    files.value = [...files.value, ...newFiles].slice(0, 5)
  }

  function removeFile(index: number) {
    files.value = files.value.filter((_, i) => i !== index)
  }

  function clear() {
    files.value = []
    response.value = null
    error.value = null
  }

  async function scan(inputFiles?: DependencyFileInput[]) {
    const payload = inputFiles ?? files.value
    if (inputFiles) files.value = inputFiles

    if (!payload.length) {
      error.value = 'Add at least one manifest file'
      return
    }

    pending.value = true
    error.value = null

    try {
      response.value = await $fetch<ScanResponse>('/api/scan', {
        method: 'POST',
        body: { files: payload }
      })
    } catch (e: unknown) {
      const err = e as { statusMessage?: string; message?: string }
      error.value = err.statusMessage ?? err.message ?? 'Scan failed'
      response.value = null
    } finally {
      pending.value = false
    }
  }

  return {
    files,
    response,
    pending,
    error,
    addFiles,
    removeFile,
    clear,
    scan
  }
}
