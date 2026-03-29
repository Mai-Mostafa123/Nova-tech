import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = {
  code: string;
  symbol: string;
  rate: number; // Rate relative to EGP (1 EGP = rate of target currency)
};

export const CURRENCIES: Currency[] = [
  { code: 'EGP', symbol: 'EGP', rate: 1 },
  { code: 'USD', symbol: '$', rate: 0.021 },
  { code: 'EUR', symbol: '€', rate: 0.019 },
  { code: 'GBP', symbol: '£', rate: 0.016 },
  { code: 'SAR', symbol: 'SR', rate: 0.078 },
  { code: 'AED', symbol: 'AED', rate: 0.076 },
  { code: 'JPY', symbol: '¥', rate: 3.12 },
  { code: 'CNY', symbol: '¥', rate: 0.15 },
  { code: 'KWD', symbol: 'KD', rate: 0.0064 },
  { code: 'QAR', symbol: 'QR', rate: 0.076 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceEGP: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

  const formatPrice = (priceEGP: number) => {
    const converted = priceEGP * currency.rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code === 'EGP' ? 'EGP' : currency.code,
      currencyDisplay: 'symbol',
    }).format(converted).replace('EGP', 'EGP ');
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
