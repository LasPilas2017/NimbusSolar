export function toCurrency(value, currency = 'GTQ', locale = 'es-GT') {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
}
