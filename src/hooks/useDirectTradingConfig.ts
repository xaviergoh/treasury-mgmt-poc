import { useState, useEffect } from 'react';
import { directTradingConfig, updateDirectTradingConfig, logConfigChange, mockPositions } from '@/data/mockData';
import { DirectTradingConfig } from '@/types/treasury';

export const useDirectTradingConfig = () => {
  const [config, setConfig] = useState<DirectTradingConfig>(directTradingConfig);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

  useEffect(() => {
    // Extract unique currencies from all positions
    const currencies = new Set<string>();
    mockPositions.forEach(pos => {
      currencies.add(pos.currency);
      pos.trades.forEach(trade => {
        const [base, quote] = trade.originalPair.split('/');
        if (base) currencies.add(base);
        if (quote) currencies.add(quote);
      });
    });
    setAvailableCurrencies(Array.from(currencies).sort());
  }, []);

  const updateConfig = (newCurrencies: string[], user: string = 'admin@treasury.com') => {
    const previousCurrencies = config.currencies;
    const updatedConfig = updateDirectTradingConfig(newCurrencies, user);
    setConfig(updatedConfig);
    logConfigChange(previousCurrencies, newCurrencies, user);
    return updatedConfig;
  };

  const checkCurrencyHasPositions = (currency: string): boolean => {
    return mockPositions.some(pos => pos.currency === currency);
  };

  return {
    config,
    availableCurrencies,
    updateConfig,
    checkCurrencyHasPositions,
  };
};
