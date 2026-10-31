export function money(amount: number | null | undefined): string {
  return `UGX ${Math.round(Number(amount ?? 0)).toLocaleString('en-US')}`;
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function time(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** Card numbers are stored uppercase without spaces or dashes. */
export function normalizeCardNumber(value: string): string {
  return value.replace(/[\s-]+/g, '').toUpperCase();
}

/** Keeps digits only, for amount fields. */
export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '');
}
