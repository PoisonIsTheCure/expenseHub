import { CURRENCY_CONFIG, formatCurrency as configFormatCurrency, isValidCurrency as configIsValidCurrency } from '../config/currency';

// Since we only support EUR now, currency conversion is simplified
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  // Since we only support EUR, no conversion is needed
  if (fromCurrency === toCurrency && fromCurrency === CURRENCY_CONFIG.code) {
    return amount;
  }
  
  // If either currency is not EUR, return the amount as-is (should not happen in normal operation)
  return amount;
};

export const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
  // Since we only support EUR, exchange rate is always 1
  return 1;
};

export const formatCurrency = (amount: number, currency: string = CURRENCY_CONFIG.code): string => {
  // Use the centralized formatting function
  return configFormatCurrency(amount);
};

export const getSupportedCurrencies = (): string[] => {
  return [CURRENCY_CONFIG.code];
};

export const isValidCurrency = (currency: string): boolean => {
  return configIsValidCurrency(currency);
};
