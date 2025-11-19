export function minutesToTime(m) {
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function timeToMinutes(t) {
  if (!t) return 0;
  const parts = t.split(':');
  if (parts.length !== 2) return 0;
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  return (hh || 0) * 60 + (mm || 0);
}
