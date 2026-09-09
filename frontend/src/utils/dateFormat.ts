export function formatDate(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

export function formatCurrency(amount: number | string | undefined, currency = 'MGA'): string {
  if (amount === undefined || amount === null) return `0 ${currency}`;
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(num)) return `0 ${currency}`;
  return `${num.toFixed(2)} ${currency}`;
}
