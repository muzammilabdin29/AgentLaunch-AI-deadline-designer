export function localISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateFromISO(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function endOfDay(iso) {
  const date = dateFromISO(iso);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}

export function daysRemaining(iso, now = new Date()) {
  const date = endOfDay(iso);
  if (!date) return 0;
  // Number of calendar days including the deadline, independent of local DST transitions.
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.round((utcEnd - utcStart) / 86400000));
}

export function prettyDate(iso, options = { month: 'short', day: 'numeric' }) {
  const date = dateFromISO(iso);
  return date ? date.toLocaleDateString('en-US', options) : 'No date';
}

export function addDaysISO(iso, n) {
  const date = dateFromISO(iso);
  if (!date) return localISO();
  date.setDate(date.getDate() + n);
  return localISO(date);
}
