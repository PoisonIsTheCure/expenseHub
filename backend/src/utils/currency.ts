// Mock exchange rates - in production, you would fetch these from an API like exchangerate.host
const EXCHANGE_RATES: { [key: string]: number } = {
  EUR: 1.0,    // Base currency
  USD: 1.08,   // 1 EUR = 1.08 USD
  GBP: 0.85,   // 1 EUR = 0.85 GBP
  JPY: 160.0,  // 1 EUR = 160 JPY
  CAD: 1.47,   // 1 EUR = 1.47 CAD
  AUD: 1.65,   // 1 EUR = 1.65 AUD
  CHF: 0.95,   // 1 EUR = 0.95 CHF
  CNY: 7.8,    // 1 EUR = 7.8 CNY
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to EUR first
  const eurAmount = amount / EXCHANGE_RATES[fromCurrency];
  
  // Convert from EUR to target currency
  const convertedAmount = eurAmount * EXCHANGE_RATES[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
};

export const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  return EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency];
};

export const formatCurrency = (amount: number, currency: string): string => {
  const symbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
  };

  const symbol = symbols[currency] || currency;
  
  // For JPY, don't show decimal places
  if (currency === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toFixed(2)}`;
};

export const getSupportedCurrencies = (): string[] => {
  return Object.keys(EXCHANGE_RATES);
};

export const isValidCurrency = (currency: string): boolean => {
  return currency in EXCHANGE_RATES;
};
