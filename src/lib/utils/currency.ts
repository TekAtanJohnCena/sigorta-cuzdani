// ============================================
// Currency & Number Formatting (Turkish Locale)
// ============================================

export function formatCurrency(
  amount: number,
  currency: 'TRY' | 'USD' | 'EUR' = 'TRY'
): string {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  };

  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `${symbols[currency]}${formatted}`;
}

export function formatCurrencyFull(
  amount: number,
  currency: 'TRY' | 'USD' | 'EUR' = 'TRY'
): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('tr-TR').format(n);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `%${value.toFixed(decimals)}`;
}
