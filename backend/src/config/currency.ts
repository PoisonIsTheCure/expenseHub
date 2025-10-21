// Centralized currency configuration
// Change this to modify the supported currency across the entire application

export const CURRENCY_CONFIG = {
  // The single supported currency
  code: 'EUR',
  symbol: '€',
  name: 'Euro',
  // Exchange rate (always 1.0 for the base currency)
  exchangeRate: 1.0,
  // Decimal places for display
  decimalPlaces: 2,
  // Whether to show decimal places (false for currencies like JPY)
  showDecimals: true,
} as const;

// Export the currency code as the default
export const DEFAULT_CURRENCY = CURRENCY_CONFIG.code;

// Export supported currencies array (only EUR for now)
export const SUPPORTED_CURRENCIES = [CURRENCY_CONFIG.code];

// Currency formatting function
export const formatCurrency = (amount: number): string => {
  if (CURRENCY_CONFIG.showDecimals) {
    return `${CURRENCY_CONFIG.symbol}${amount.toFixed(CURRENCY_CONFIG.decimalPlaces)}`;
  }
  return `${CURRENCY_CONFIG.symbol}${Math.round(amount).toLocaleString()}`;
};

// Validation function
export const isValidCurrency = (currency: string): boolean => {
  return currency === CURRENCY_CONFIG.code;
};

// Get currency info
export const getCurrencyInfo = () => ({
  code: CURRENCY_CONFIG.code,
  symbol: CURRENCY_CONFIG.symbol,
  name: CURRENCY_CONFIG.name,
});
