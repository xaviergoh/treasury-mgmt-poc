import { Position, Hedge, ResetRequest, AuditEvent, MarketRate, Trade, DirectTradingConfig } from '@/types/treasury';

// G10 Currencies - Default Direct Trading Currencies (includes SGD)
export const G10_CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'NZD', 'SEK', 'NOK', 'SGD'];

// Additional non-G10 currencies for mock data showcase
const ADDITIONAL_CURRENCIES = ['MYR', 'HKD', 'CNH'];

// Helper to normalize pair keys (always alphabetical)
export const normalizePair = (base: string, quote: string): string => {
  return [base, quote].sort().join('/');
};

// Initialize default pair configurations
const initializeDefaultPairConfigs = (): Record<string, 'direct' | 'exotic'> => {
  const configs: Record<string, 'direct' | 'exotic'> = {};
  
  // All G10xG10 pairs are 'direct' (now includes SGD)
  for (let i = 0; i < G10_CURRENCIES.length; i++) {
    for (let j = i + 1; j < G10_CURRENCIES.length; j++) {
      const pair = normalizePair(G10_CURRENCIES[i], G10_CURRENCIES[j]);
      configs[pair] = 'direct';
    }
  }
  
  // Configure specific non-G10 pairs as examples
  // MYR/HKD: Exotic (requires USD routing)
  configs[normalizePair('MYR', 'HKD')] = 'exotic';
  
  // CNH/SGD: Exotic (requires USD routing)
  configs[normalizePair('CNH', 'SGD')] = 'exotic';
  
  return configs;
};

// Direct Trading Configuration
export let directTradingConfig: DirectTradingConfig = {
  id: 'default-config',
  currencies: [...G10_CURRENCIES, ...ADDITIONAL_CURRENCIES],
  hiddenCurrencies: [],
  pairConfigurations: initializeDefaultPairConfigs(),
  lastModifiedBy: 'System',
  lastModifiedAt: new Date().toISOString(),
};

// Helper function to check if a currency pair trades directly
export const isDirectPair = (baseCcy: string, quoteCcy: string): boolean => {
  const pair = normalizePair(baseCcy, quoteCcy);
  return directTradingConfig.pairConfigurations[pair] === 'direct';
};

// Helper to get pair status
export const getPairStatus = (base: string, quote: string): 'direct' | 'exotic' => {
  const pair = normalizePair(base, quote);
  return directTradingConfig.pairConfigurations[pair] || 'exotic';
};

// Helper function to update configuration
export const updateDirectTradingConfig = (
  newCurrencies: string[], 
  newPairConfigs: Record<string, 'direct' | 'exotic'>,
  newHiddenCurrencies: string[],
  user: string
): DirectTradingConfig => {
  const previousConfig = { ...directTradingConfig };
  directTradingConfig = {
    id: directTradingConfig.id,
    currencies: [...newCurrencies],
    hiddenCurrencies: [...newHiddenCurrencies],
    pairConfigurations: { ...newPairConfigs },
    lastModifiedBy: user,
    lastModifiedAt: new Date().toISOString(),
    previousCurrencies: previousConfig.currencies,
  };
  return directTradingConfig;
};

// Helper function to log configuration changes to audit trail
export const logConfigChange = (
  previousCurrencies: string[],
  newCurrencies: string[],
  previousPairConfigs: Record<string, 'direct' | 'exotic'>,
  newPairConfigs: Record<string, 'direct' | 'exotic'>,
  user: string
): AuditEvent => {
  const added = newCurrencies.filter(c => !previousCurrencies.includes(c));
  const removed = previousCurrencies.filter(c => !newCurrencies.includes(c));
  
  // Track pair changes
  const pairsChanged: Array<{ pair: string; from: 'direct' | 'exotic'; to: 'direct' | 'exotic' }> = [];
  const allPairs = new Set([...Object.keys(previousPairConfigs), ...Object.keys(newPairConfigs)]);
  
  allPairs.forEach(pair => {
    const oldStatus = previousPairConfigs[pair];
    const newStatus = newPairConfigs[pair];
    if (oldStatus && newStatus && oldStatus !== newStatus) {
      pairsChanged.push({ pair, from: oldStatus, to: newStatus });
    }
  });
  
  const event: AuditEvent = {
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: 'Configuration Change',
    description: 'Direct Trading configuration updated',
    user,
    details: {
      previousCurrencies,
      newCurrencies,
      currenciesAdded: added,
      currenciesRemoved: removed,
      pairsChanged,
      totalPairsModified: pairsChanged.length,
      impactScope: 'Applies to new trades only',
    },
    status: 'Completed',
  };
  
  mockAuditEvents.unshift(event);
  return event;
};

export const mockMarketRates: MarketRate[] = [
  { pair: 'USD/SGD', bid: 1.3420, ask: 1.3425, mid: 1.3422, change: 0.0012, changePercent: 0.09, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/USD', bid: 1.0850, ask: 1.0855, mid: 1.0852, change: -0.0023, changePercent: -0.21, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/USD', bid: 1.2720, ask: 1.2725, mid: 1.2722, change: 0.0045, changePercent: 0.35, lastUpdate: new Date().toISOString() },
  { pair: 'AUD/USD', bid: 0.6580, ask: 0.6585, mid: 0.6582, change: -0.0008, changePercent: -0.12, lastUpdate: new Date().toISOString() },
  { pair: 'USD/JPY', bid: 149.25, ask: 149.30, mid: 149.27, change: 0.35, changePercent: 0.23, lastUpdate: new Date().toISOString() },
  { pair: 'USD/CAD', bid: 1.3580, ask: 1.3585, mid: 1.3582, change: 0.0018, changePercent: 0.13, lastUpdate: new Date().toISOString() },
  { pair: 'USD/CHF', bid: 0.8720, ask: 0.8725, mid: 0.8722, change: -0.0012, changePercent: -0.14, lastUpdate: new Date().toISOString() },
  { pair: 'NZD/USD', bid: 0.5980, ask: 0.5985, mid: 0.5982, change: 0.0015, changePercent: 0.25, lastUpdate: new Date().toISOString() },
  { pair: 'USD/MYR', bid: 4.4625, ask: 4.4675, mid: 4.4650, change: 0.0025, changePercent: 0.06, lastUpdate: new Date().toISOString() },
  { pair: 'USD/HKD', bid: 7.8185, ask: 7.8215, mid: 7.8200, change: -0.0015, changePercent: -0.02, lastUpdate: new Date().toISOString() },
  { pair: 'USD/CNH', bid: 7.2425, ask: 7.2475, mid: 7.2450, change: 0.0050, changePercent: 0.07, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/SGD', bid: 1.4560, ask: 1.4565, mid: 1.4562, change: 0.0015, changePercent: 0.10, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/GBP', bid: 0.8525, ask: 0.8530, mid: 0.8527, change: -0.0008, changePercent: -0.09, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/JPY', bid: 162.05, ask: 162.15, mid: 162.10, change: 0.48, changePercent: 0.30, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/JPY', bid: 190.10, ask: 190.20, mid: 190.15, change: 0.65, changePercent: 0.34, lastUpdate: new Date().toISOString() },
  { pair: 'JPY/SGD', bid: 0.00898, ask: 0.00902, mid: 0.00900, change: 0.00003, changePercent: 0.33, lastUpdate: new Date().toISOString() },
  { pair: 'AUD/SGD', bid: 0.8828, ask: 0.8836, mid: 0.8832, change: -0.0012, changePercent: -0.14, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/SGD', bid: 1.7080, ask: 1.7085, mid: 1.7082, change: 0.0062, changePercent: 0.36, lastUpdate: new Date().toISOString() },
  { pair: 'CAD/SGD', bid: 0.9882, ask: 0.9890, mid: 0.9886, change: 0.0005, changePercent: 0.05, lastUpdate: new Date().toISOString() },
  { pair: 'CHF/SGD', bid: 1.5385, ask: 1.5392, mid: 1.5388, change: 0.0022, changePercent: 0.14, lastUpdate: new Date().toISOString() },
  { pair: 'NZD/SGD', bid: 0.8025, ask: 0.8032, mid: 0.8028, change: -0.0008, changePercent: -0.10, lastUpdate: new Date().toISOString() },
];

// ============================================================================
// EXOTIC PAIR DECOMPOSITION LOGIC:
// When a customer trades a non-USD pair (e.g., JPY/SGD):
// 1. Break down into two USD legs
// 2. First leg: Convert base currency to/from USD
// 3. Second leg: Convert USD to/from quote currency
// 4. This creates positions in BOTH currencies
// 5. The intermediate USD exposure is reflected in both legs
// ============================================================================

export const mockPositions: Position[] = [
  {
    id: 'POS-0001',
    currency: 'SGD',
    liquidityProvider: 'Citibank',
    netPosition: 2500000,
    currentRate: 1.3422,
    mtmValue: 1862335,
    unrealizedPnL: 10500,
    realizedPnL: 5200,
    status: 'Open',
    trades: [
      // Standard USD/SGD trade
      {
        id: 'TRD-0001',
        tradeDate: new Date(Date.now() - 86400000).toISOString(),
        customerOrder: 'CUST-001',
        originalPair: 'USD/SGD',
        originalAmount: 1500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/SGD', buy_amount: 1500000, sell_amount: 0, usd_position: 1500000, local_position: 1500000, rate: 1.3400, legType: 'Buy Leg' }
        ]
      },
      // EUR/SGD - Direct pair (G10xG10)
      {
        id: 'TRD-0002',
        tradeDate: new Date(Date.now() - 172800000).toISOString(),
        customerOrder: 'CUST-005',
        originalPair: 'EUR/SGD',
        originalAmount: 1000000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/SGD', buy_amount: 1000000, sell_amount: 0, usd_position: 0, local_position: 1000000, rate: 1.4580, legType: 'Buy Leg' }
        ]
      },
      // JPY/SGD - Direct pair (G10xG10)
      {
        id: 'TRD-0008',
        tradeDate: new Date(Date.now() - 259200000).toISOString(),
        customerOrder: 'CUST-048',
        originalPair: 'JPY/SGD',
        originalAmount: 15000000, // 15M JPY
        isExoticPair: false,
        usdLegs: [
          { pair: 'JPY/SGD', buy_amount: 15000000, sell_amount: 0, usd_position: 0, local_position: 15000000, rate: 0.00900, legType: 'Buy Leg' }
        ]
      },
      // AUD/SGD - Direct pair (G10xG10)
      {
        id: 'TRD-0009',
        tradeDate: new Date(Date.now() - 345600000).toISOString(),
        customerOrder: 'CUST-052',
        originalPair: 'AUD/SGD',
        originalAmount: 500000, // 500K AUD
        isExoticPair: false,
        usdLegs: [
          { pair: 'AUD/SGD', buy_amount: 500000, sell_amount: 0, usd_position: 0, local_position: 500000, rate: 0.8832, legType: 'Buy Leg' }
        ]
      },
      // GBP/SGD - Direct pair (G10xG10)
      {
        id: 'TRD-0010',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-061',
        originalPair: 'GBP/SGD',
        originalAmount: 300000, // Buying 300K GBP (from SGD perspective, selling SGD)
        isExoticPair: false,
        usdLegs: [
          { pair: 'GBP/SGD', buy_amount: 300000, sell_amount: 0, usd_position: 0, local_position: 300000, rate: 1.7082, legType: 'Buy Leg' }
        ]
      },
      // CAD/SGD - Direct pair (G10xG10)
      {
        id: 'TRD-0020',
        tradeDate: new Date(Date.now() - 1382400000).toISOString(),
        customerOrder: 'CUST-168',
        originalPair: 'CAD/SGD',
        originalAmount: -800000, // Selling CAD (from SGD perspective, buying SGD)
        isExoticPair: false,
        usdLegs: [
          { pair: 'CAD/SGD', buy_amount: 0, sell_amount: 800000, usd_position: 0, local_position: -800000, rate: 0.9880, legType: 'Sell Leg' }
        ]
      },
      // CHF/SGD - Direct pair (G10xG10)
      {
        id: 'TRD-0023',
        tradeDate: new Date(Date.now() - 1641600000).toISOString(),
        customerOrder: 'CUST-201',
        originalPair: 'CHF/SGD',
        originalAmount: 250000, // Buying CHF (from SGD perspective, selling SGD)
        isExoticPair: false,
        usdLegs: [
          { pair: 'CHF/SGD', buy_amount: 250000, sell_amount: 0, usd_position: 0, local_position: 250000, rate: 1.5380, legType: 'Buy Leg' }
        ]
      },
      // NZD/SGD - Direct pair (G10xG10)
      {
        id: 'TRD-0025',
        tradeDate: new Date(Date.now() - 1814400000).toISOString(),
        customerOrder: 'CUST-228',
        originalPair: 'NZD/SGD',
        originalAmount: -400000, // Selling NZD (from SGD perspective, buying SGD)
        isExoticPair: false,
        usdLegs: [
          { pair: 'NZD/SGD', buy_amount: 0, sell_amount: 400000, usd_position: 0, local_position: -400000, rate: 0.8020, legType: 'Sell Leg' }
        ]
      },
      // CNH/SGD - Exotic pair (non-G10 requires USD routing)
      {
        id: 'TRD-0011',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'CNH/SGD',
        originalAmount: 554866, // Buying 554,866 SGD
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell CNH, buy SGD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/CNH', buy_amount: 0, sell_amount: 3000000, usd_position: 414079, local_position: -3000000, rate: 7.2450, legType: 'Buy Leg' },
          { pair: 'USD/SGD', buy_amount: 554866, sell_amount: 0, usd_position: -414079, local_position: 554866, rate: 1.3400, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0002',
    currency: 'EUR',
    liquidityProvider: 'HSBC',
    netPosition: -500000,
    currentRate: 1.0852,
    mtmValue: -542600,
    unrealizedPnL: 8200,
    realizedPnL: -2100,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0003',
        tradeDate: new Date(Date.now() - 259200000).toISOString(),
        customerOrder: 'CUST-012',
        originalPair: 'EUR/USD',
        originalAmount: -1800000,
        usdLegs: [
          { pair: 'EUR/USD', buy_amount: 0, sell_amount: 1800000, usd_position: -1965600, local_position: -1800000, rate: 1.0920, legType: 'Sell Leg' }
        ]
      },
      // EUR/SGD cross-currency trade (also in SGD position)
      {
        id: 'TRD-0002',
        tradeDate: new Date(Date.now() - 172800000).toISOString(),
        customerOrder: 'CUST-005',
        originalPair: 'EUR/SGD',
        originalAmount: 1000000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/SGD', buy_amount: 1000000, sell_amount: 0, usd_position: 0, local_position: 1000000, rate: 1.4580, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0012',
        tradeDate: new Date(Date.now() - 691200000).toISOString(),
        customerOrder: 'CUST-082',
        originalPair: 'EUR/GBP',
        originalAmount: 800000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/GBP', buy_amount: 800000, sell_amount: 0, usd_position: 0, local_position: 800000, rate: 0.8520, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0013',
        tradeDate: new Date(Date.now() - 777600000).toISOString(),
        customerOrder: 'CUST-095',
        originalPair: 'EUR/JPY',
        originalAmount: -500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/JPY', buy_amount: 0, sell_amount: 500000, usd_position: 0, local_position: -500000, rate: 161.80, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0003',
    currency: 'GBP',
    liquidityProvider: 'Standard Chartered',
    netPosition: 700000,
    currentRate: 1.2722,
    mtmValue: 890540,
    unrealizedPnL: 6100,
    realizedPnL: 3400,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0004',
        tradeDate: new Date(Date.now() - 345600000).toISOString(),
        customerOrder: 'CUST-018',
        originalPair: 'GBP/USD',
        originalAmount: 1200000,
        usdLegs: [
          { pair: 'GBP/USD', buy_amount: 1200000, sell_amount: 0, usd_position: 1518000, local_position: 1200000, rate: 1.2650, legType: 'Buy Leg' }
        ]
      },
      // GBP/SGD cross-currency trade (also in SGD position)
      {
        id: 'TRD-0010',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-061',
        originalPair: 'GBP/SGD',
        originalAmount: -300000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'GBP/SGD', buy_amount: 0, sell_amount: 300000, usd_position: 0, local_position: -300000, rate: 1.7082, legType: 'Sell Leg' }
        ]
      },
      // EUR/GBP cross-currency trade (also in EUR position)
      {
        id: 'TRD-0012',
        tradeDate: new Date(Date.now() - 691200000).toISOString(),
        customerOrder: 'CUST-082',
        originalPair: 'EUR/GBP',
        originalAmount: -800000, // Selling 800K EUR, buying GBP
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/GBP', buy_amount: 0, sell_amount: 800000, usd_position: 0, local_position: -800000, rate: 0.8520, legType: 'Sell Leg' }
        ]
      },
      {
        id: 'TRD-0014',
        tradeDate: new Date(Date.now() - 864000000).toISOString(),
        customerOrder: 'CUST-103',
        originalPair: 'GBP/JPY',
        originalAmount: 600000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'GBP/JPY', buy_amount: 600000, sell_amount: 0, usd_position: 0, local_position: 600000, rate: 189.50, legType: 'Buy Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0004',
    currency: 'AUD',
    liquidityProvider: 'DBS',
    netPosition: -450000, // Updated from exotic AUD/SGD trade
    currentRate: 0.6582,
    mtmValue: -296190,
    unrealizedPnL: 1850,
    realizedPnL: -900,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0005',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-024',
        originalPair: 'AUD/USD',
        originalAmount: -950000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'AUD/USD', buy_amount: 0, sell_amount: 950000, usd_position: -628900, local_position: -950000, rate: 0.6620, legType: 'Sell Leg' }
        ]
      },
      // Corresponding AUD/SGD trade - Direct pair (G10xG10)
      {
        id: 'TRD-0009-AUD',
        tradeDate: new Date(Date.now() - 345600000).toISOString(),
        customerOrder: 'CUST-052',
        originalPair: 'AUD/SGD',
        originalAmount: 500000, // Selling 500K AUD
        isExoticPair: false,
        usdLegs: [
          { pair: 'AUD/SGD', buy_amount: 500000, sell_amount: 0, usd_position: 0, local_position: 500000, rate: 0.8832, legType: 'Buy Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0005',
    currency: 'JPY',
    liquidityProvider: 'UOB',
    netPosition: -92300000,
    currentRate: 149.27,
    mtmValue: -618300,
    unrealizedPnL: -4800,
    realizedPnL: 3200,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0006',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-031',
        originalPair: 'USD/JPY',
        originalAmount: 3200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/JPY', buy_amount: 3200000, sell_amount: 0, usd_position: 21505, local_position: 3200000, rate: 148.80, legType: 'Buy Leg' }
        ]
      },
      // JPY/SGD cross-currency trade (also in SGD position)
      {
        id: 'TRD-0008',
        tradeDate: new Date(Date.now() - 259200000).toISOString(),
        customerOrder: 'CUST-048',
        originalPair: 'JPY/SGD',
        originalAmount: -15000000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'JPY/SGD', buy_amount: 0, sell_amount: 15000000, usd_position: 0, local_position: -15000000, rate: 0.00900, legType: 'Sell Leg' }
        ]
      },
      // EUR/JPY cross-currency trade (also in EUR position)
      {
        id: 'TRD-0013',
        tradeDate: new Date(Date.now() - 777600000).toISOString(),
        customerOrder: 'CUST-095',
        originalPair: 'EUR/JPY',
        originalAmount: 80900000, // Buying JPY
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/JPY', buy_amount: 80900000, sell_amount: 0, usd_position: 0, local_position: 80900000, rate: 161.80, legType: 'Buy Leg' }
        ]
      },
      // GBP/JPY cross-currency trade (also in GBP position)
      {
        id: 'TRD-0014',
        tradeDate: new Date(Date.now() - 864000000).toISOString(),
        customerOrder: 'CUST-103',
        originalPair: 'GBP/JPY',
        originalAmount: -113700000, // Selling JPY
        isExoticPair: false,
        usdLegs: [
          { pair: 'GBP/JPY', buy_amount: 0, sell_amount: 113700000, usd_position: 0, local_position: -113700000, rate: 189.50, legType: 'Sell Leg' }
        ]
      },
      {
        id: 'TRD-0015',
        tradeDate: new Date(Date.now() - 950400000).toISOString(),
        customerOrder: 'CUST-118',
        originalPair: 'USD/JPY',
        originalAmount: 52500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/JPY', buy_amount: 52500000, sell_amount: 0, usd_position: 353535, local_position: 52500000, rate: 148.50, legType: 'Buy Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0006',
    currency: 'MYR',
    liquidityProvider: 'Citibank',
    netPosition: 9200000,
    currentRate: 4.4650,
    mtmValue: 2061033,
    unrealizedPnL: 8500,
    realizedPnL: 4200,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0007',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'MYR/HKD',
        originalAmount: 4500000, // Buying 4.5M MYR
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy MYR, sell HKD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 4500000, sell_amount: 0, usd_position: -1011236, local_position: 4500000, rate: 4.4500, legType: 'Sell Leg' },
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 7910026, usd_position: 1011236, local_position: -7910026, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0016',
        tradeDate: new Date(Date.now() - 1036800000).toISOString(),
        customerOrder: 'CUST-126',
        originalPair: 'USD/MYR',
        originalAmount: 2500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 2500000, sell_amount: 0, usd_position: 562838, local_position: 2500000, rate: 4.4400, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0017',
        tradeDate: new Date(Date.now() - 1123200000).toISOString(),
        customerOrder: 'CUST-134',
        originalPair: 'MYR/HKD',
        originalAmount: 2200000, // Buying 2.2M MYR
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy MYR, sell HKD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 2200000, sell_amount: 0, usd_position: -494382, local_position: 2200000, rate: 4.4500, legType: 'Sell Leg' },
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 3866467, usd_position: 494382, local_position: -3866467, rate: 7.8200, legType: 'Buy Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0007',
    currency: 'CNH',
    liquidityProvider: 'HSBC',
    netPosition: -5200000,
    currentRate: 7.2450,
    mtmValue: -717838,
    unrealizedPnL: -3800,
    realizedPnL: 1900,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0011',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'CNH/SGD',
        originalAmount: -3000000, // Selling 3M CNH
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell CNH, buy SGD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/CNH', buy_amount: 0, sell_amount: 3000000, usd_position: 414079, local_position: -3000000, rate: 7.2450, legType: 'Buy Leg' },
          { pair: 'USD/SGD', buy_amount: 554866, sell_amount: 0, usd_position: -414079, local_position: 554866, rate: 1.3400, legType: 'Sell Leg' }
        ]
      },
      {
        id: 'TRD-0018',
        tradeDate: new Date(Date.now() - 1209600000).toISOString(),
        customerOrder: 'CUST-145',
        originalPair: 'USD/CNH',
        originalAmount: -2200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/CNH', buy_amount: 0, sell_amount: 2200000, usd_position: -304709, local_position: -2200000, rate: 7.2200, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0008',
    currency: 'CAD',
    liquidityProvider: 'RBC',
    netPosition: 2100000,
    currentRate: 1.3582,
    mtmValue: 1546122,
    unrealizedPnL: 5800,
    realizedPnL: 2900,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0019',
        tradeDate: new Date(Date.now() - 1296000000).toISOString(),
        customerOrder: 'CUST-152',
        originalPair: 'USD/CAD',
        originalAmount: 1500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/CAD', buy_amount: 1500000, sell_amount: 0, usd_position: 1106940, local_position: 1500000, rate: 1.3550, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0020',
        tradeDate: new Date(Date.now() - 1382400000).toISOString(),
        customerOrder: 'CUST-168',
        originalPair: 'CAD/SGD',
        originalAmount: 800000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'CAD/SGD', buy_amount: 800000, sell_amount: 0, usd_position: 0, local_position: 800000, rate: 0.9880, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0021',
        tradeDate: new Date(Date.now() - 1468800000).toISOString(),
        customerOrder: 'CUST-179',
        originalPair: 'USD/CAD',
        originalAmount: -200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/CAD', buy_amount: 0, sell_amount: 200000, usd_position: -147059, local_position: -200000, rate: 1.3600, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0009',
    currency: 'CHF',
    liquidityProvider: 'UBS',
    netPosition: -850000,
    currentRate: 0.8722,
    mtmValue: -974370,
    unrealizedPnL: 3200,
    realizedPnL: -1800,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0022',
        tradeDate: new Date(Date.now() - 1555200000).toISOString(),
        customerOrder: 'CUST-187',
        originalPair: 'USD/CHF',
        originalAmount: -600000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/CHF', buy_amount: 0, sell_amount: 600000, usd_position: -685714, local_position: -600000, rate: 0.8750, legType: 'Sell Leg' }
        ]
      },
      {
        id: 'TRD-0023',
        tradeDate: new Date(Date.now() - 1641600000).toISOString(),
        customerOrder: 'CUST-201',
        originalPair: 'CHF/SGD',
        originalAmount: -250000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'CHF/SGD', buy_amount: 0, sell_amount: 250000, usd_position: 0, local_position: -250000, rate: 1.5380, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0010',
    currency: 'NZD',
    liquidityProvider: 'ANZ',
    netPosition: 980000,
    currentRate: 0.5982,
    mtmValue: 586236,
    unrealizedPnL: 4100,
    realizedPnL: 2200,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0024',
        tradeDate: new Date(Date.now() - 1728000000).toISOString(),
        customerOrder: 'CUST-215',
        originalPair: 'NZD/USD',
        originalAmount: 1200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'NZD/USD', buy_amount: 1200000, sell_amount: 0, usd_position: 714000, local_position: 1200000, rate: 0.5950, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0025',
        tradeDate: new Date(Date.now() - 1814400000).toISOString(),
        customerOrder: 'CUST-228',
        originalPair: 'NZD/SGD',
        originalAmount: 400000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'NZD/SGD', buy_amount: 400000, sell_amount: 0, usd_position: 0, local_position: 400000, rate: 0.8020, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0026',
        tradeDate: new Date(Date.now() - 1900800000).toISOString(),
        customerOrder: 'CUST-241',
        originalPair: 'NZD/USD',
        originalAmount: -620000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'NZD/USD', buy_amount: 0, sell_amount: 620000, usd_position: -372000, local_position: -620000, rate: 0.6000, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0011',
    currency: 'HKD',
    liquidityProvider: 'Bank of China HK',
    netPosition: -12500000,
    currentRate: 7.8200,
    mtmValue: -1598465,
    unrealizedPnL: -6200,
    realizedPnL: 3100,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0007',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'MYR/HKD',
        originalAmount: -7910026, // Selling 7.91M HKD
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy MYR, sell HKD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 4500000, sell_amount: 0, usd_position: -1011236, local_position: 4500000, rate: 4.4500, legType: 'Sell Leg' },
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 7910026, usd_position: 1011236, local_position: -7910026, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0017',
        tradeDate: new Date(Date.now() - 1123200000).toISOString(),
        customerOrder: 'CUST-134',
        originalPair: 'MYR/HKD',
        originalAmount: -3866467, // Selling 3.87M HKD
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy MYR, sell HKD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 2200000, sell_amount: 0, usd_position: -494382, local_position: 2200000, rate: 4.4500, legType: 'Sell Leg' },
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 3866467, usd_position: 494382, local_position: -3866467, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0027',
        tradeDate: new Date(Date.now() - 1987200000).toISOString(),
        customerOrder: 'CUST-256',
        originalPair: 'USD/HKD',
        originalAmount: -723507,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 723507, usd_position: 92649, local_position: -723507, rate: 7.8100, legType: 'Buy Leg' }
        ]
      }
    ]
  },
  // USD Position - Aggregates all exotic trade USD legs
  {
    id: 'POS-USD',
    currency: 'USD',
    liquidityProvider: 'Multiple',
    netPosition: 0, // Sum of all USD legs: should be near zero for balanced exotic trades
    currentRate: 1.0000,
    mtmValue: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    status: 'Open',
    trades: [
      // USD/MYR leg from TRD-0007
      {
        id: 'TRD-0007-USDMYR',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'USD/MYR',
        originalAmount: -1011236, // Short USD (selling USD to buy MYR)
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade MYR/HKD (TRD-0007). Buying 4.5M MYR requires selling USD.',
        parentTradeId: 'TRD-0007',
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 4500000, sell_amount: 0, usd_position: -1011236, local_position: 4500000, rate: 4.4500, legType: 'Sell Leg' }
        ]
      },
      // USD/HKD leg from TRD-0007
      {
        id: 'TRD-0007-USDHKD',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'USD/HKD',
        originalAmount: 1011236, // Long USD (buying USD by selling HKD)
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade MYR/HKD (TRD-0007). Selling 7.91M HKD generates USD.',
        parentTradeId: 'TRD-0007',
        usdLegs: [
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 7910026, usd_position: 1011236, local_position: -7910026, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      // USD/CNH leg from TRD-0011
      {
        id: 'TRD-0011-USDCNH',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'USD/CNH',
        originalAmount: 414079, // Long USD (buying USD by selling CNH)
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade CNH/SGD (TRD-0011). Selling 3M CNH generates USD.',
        parentTradeId: 'TRD-0011',
        usdLegs: [
          { pair: 'USD/CNH', buy_amount: 0, sell_amount: 3000000, usd_position: 414079, local_position: -3000000, rate: 7.2450, legType: 'Buy Leg' }
        ]
      },
      // USD/SGD leg from TRD-0011
      {
        id: 'TRD-0011-USDSGD',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'USD/SGD',
        originalAmount: -414079, // Short USD (selling USD to buy SGD)
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade CNH/SGD (TRD-0011). Buying 554,866 SGD requires selling USD.',
        parentTradeId: 'TRD-0011',
        usdLegs: [
          { pair: 'USD/SGD', buy_amount: 554866, sell_amount: 0, usd_position: -414079, local_position: 554866, rate: 1.3400, legType: 'Sell Leg' }
        ]
      },
      // USD/MYR leg from TRD-0017
      {
        id: 'TRD-0017-USDMYR',
        tradeDate: new Date(Date.now() - 1123200000).toISOString(),
        customerOrder: 'CUST-134',
        originalPair: 'USD/MYR',
        originalAmount: -494382, // Short USD (selling USD to buy MYR)
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade MYR/HKD (TRD-0017). Buying 2.2M MYR requires selling USD.',
        parentTradeId: 'TRD-0017',
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 2200000, sell_amount: 0, usd_position: -494382, local_position: 2200000, rate: 4.4500, legType: 'Sell Leg' }
        ]
      },
      // USD/HKD leg from TRD-0017
      {
        id: 'TRD-0017-USDHKD',
        tradeDate: new Date(Date.now() - 1123200000).toISOString(),
        customerOrder: 'CUST-134',
        originalPair: 'USD/HKD',
        originalAmount: 494382, // Long USD (buying USD by selling HKD)
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade MYR/HKD (TRD-0017). Selling 3.87M HKD generates USD.',
        parentTradeId: 'TRD-0017',
        usdLegs: [
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 3866467, usd_position: 494382, local_position: -3866467, rate: 7.8200, legType: 'Buy Leg' }
        ]
      }
    ]
  }
];

export const mockHedges: Hedge[] = [
  {
    id: 'HDG-0001',
    currencyPair: 'USD/SGD',
    type: 'Forward',
    amount: 500000,
    rate: 1.3400,
    liquidityProvider: 'Citibank',
    externalReference: 'FWD-2024-001',
    status: 'Fully Matched',
    requiresDualAuth: false,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'HDG-0002',
    currencyPair: 'EUR/USD',
    type: 'Spot',
    amount: 2000000,
    rate: 1.0880,
    liquidityProvider: 'HSBC',
    externalReference: 'SPOT-2024-042',
    status: 'Pending',
    requiresDualAuth: true,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'HDG-0003',
    currencyPair: 'GBP/USD',
    type: 'NDF',
    amount: 750000,
    rate: 1.2700,
    liquidityProvider: 'Standard Chartered',
    externalReference: 'NDF-2024-018',
    status: 'Partially Matched',
    requiresDualAuth: false,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const mockResetRequests: ResetRequest[] = [
  {
    id: 'RST-0001',
    positionId: 'POS-0001',
    currentPosition: 2500000,
    targetPosition: 2300000,
    reason: 'Cancelled Deal Correction',
    justification: 'Customer cancelled spot deal worth USD 200,000 due to documentation issues. Need to reverse the position impact to maintain accurate treasury records.',
    status: 'First Approved',
    requestedBy: 'john.trader@company.com',
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    approvals: [
      {
        level: 1,
        approver: 'sarah.manager@company.com',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        comments: 'Verified cancellation documentation. Approved for CFO review.',
      },
    ],
  },
  {
    id: 'RST-0002',
    positionId: 'POS-0003',
    currentPosition: 1200000,
    targetPosition: 1500000,
    reason: 'System Error Correction',
    justification: 'Identified system error in position calculation from last week. Three forward contracts totaling GBP 300,000 were not properly recorded in the system. IT has confirmed the root cause and implemented a fix.',
    status: 'Pending',
    requestedBy: 'mike.ops@company.com',
    requestedAt: new Date(Date.now() - 3600000).toISOString(),
    approvals: [],
  },
];

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'AUD-0000',
    timestamp: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    eventType: 'Configuration Change',
    description: 'Updated Direct Trading Configuration: Added SGD to G10 currencies and configured MYR, HKD, CNH pairs',
    user: 'system@4xcommand.com',
    details: {
      currenciesAdded: ['SGD', 'MYR', 'HKD', 'CNH'],
      pairsConfigured: {
        'EUR/SGD': 'direct',
        'JPY/SGD': 'direct',
        'AUD/SGD': 'direct',
        'GBP/SGD': 'direct',
        'MYR/HKD': 'exotic',
        'CNH/SGD': 'exotic'
      },
      rationale: 'SGD elevated to G10 status for direct trading. Regional currencies MYR, HKD, CNH added for Asia-Pacific market coverage.'
    },
    status: 'Completed',
  },
  {
    id: 'AUD-0001',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    eventType: 'Hedge Entry',
    description: 'Manual hedge entry submitted for approval',
    user: 'john.trader@company.com',
    details: { hedgeId: 'HDG-0002', amount: 2000000, pair: 'EUR/USD' },
    status: 'Pending',
  },
  {
    id: 'AUD-0002',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    eventType: 'Approval',
    description: 'First level approval for position reset',
    user: 'sarah.manager@company.com',
    details: { resetId: 'RST-0001', level: 1 },
    status: 'Approved',
  },
  {
    id: 'AUD-0003',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    eventType: 'Hedge Entry',
    description: 'Forward hedge executed and matched',
    user: 'john.trader@company.com',
    details: { hedgeId: 'HDG-0001', amount: 500000, pair: 'USD/SGD' },
    status: 'Completed',
  },
  {
    id: 'AUD-0004',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    eventType: 'Rate Update',
    description: 'Market rates updated from Reuters feed',
    user: 'system',
    details: { pairs: 7, source: 'Reuters' },
    status: 'Completed',
  },
];
