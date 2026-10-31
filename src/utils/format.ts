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

/**
 * Card QR codes hold only the raw card number. Returns null for any other QR code
 * (a URL, a payment code…) so it is never sent to the API as a card number.
 */
export function cardNumberFromQr(data: string): string | null {
  const number = normalizeCardNumber(data.trim());
  return /^[A-Z0-9]{4,32}$/.test(number) ? number : null;
}

/** Shows a card number in groups of four, as printed on the card. */
export function groupCardNumber(value: string): string {
  return normalizeCardNumber(value).replace(/(.{4})(?=.)/g, '$1 ');
}

/** Keeps digits only, for amount fields. */
export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '');
}
