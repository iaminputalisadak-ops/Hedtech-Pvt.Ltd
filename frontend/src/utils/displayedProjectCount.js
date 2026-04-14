/**
 * Public hero / About stats: use `settings.project_count` when it is a valid non‑negative integer,
 * otherwise fall back to how many projects the bootstrap payload includes.
 * (Avoids `project_count || n` bugs: `'0'` is truthy and empty settings during load used to show `0+`.)
 */
export function displayedProjectCount(settings, projects) {
  const raw = String(settings?.project_count ?? '').trim()
  if (raw !== '') {
    const n = Number.parseInt(raw, 10)
    if (Number.isFinite(n) && n >= 0) return String(n)
  }
  return String(projects?.length ?? 0)
}
