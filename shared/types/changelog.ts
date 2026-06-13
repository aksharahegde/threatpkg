export interface ChangelogRelease {
  version: string
  date: string | null
  body: string
}

export interface ChangelogResponse {
  releases: ChangelogRelease[]
}
