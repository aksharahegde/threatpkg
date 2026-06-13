import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ChangelogResponse } from '#shared/types/changelog'
import { readChangelogReleases } from '../utils/changelog'

const rootDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

export default defineCachedEventHandler(
  async (): Promise<ChangelogResponse> => {
    const releases = await readChangelogReleases(rootDir)
    return { releases }
  },
  {
    maxAge: 3600,
    name: 'changelog',
    swr: true
  }
)
