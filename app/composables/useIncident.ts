import type { IncidentDetail } from '#shared/types/threat'

export function useIncident(id: MaybeRefOrGetter<string>) {
  const incidentId = toRef(id)

  return useFetch<IncidentDetail>(() => `/api/incidents/${incidentId.value}`, {
    watch: [incidentId]
  })
}
