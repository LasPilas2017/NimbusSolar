export function formatDate(date, locale = 'es-GT', opts) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(locale, {
    day: '2-digit', month: 'short', year: 'numeric', ...(opts ?? {})
  });
}
