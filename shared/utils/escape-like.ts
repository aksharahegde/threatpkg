/** Escape `%`, `_`, and `\` for SQL `LIKE` / `ILIKE` with `ESCAPE '\'` */
export function escapeLikePattern(raw: string): string {
  return raw.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}
