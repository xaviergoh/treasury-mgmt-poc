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
  { pair: 'USD/MYR', bid: 4.4625, ask: 4.4675, mid: 4.4650, change: 0.0025, changePercent: 0.06, lastUpdate: new Date().toISOString() },
  { pair: 'USD/HKD', bid: 7.8185, ask: 7.8215, mid: 7.8200, change: -0.0015, changePercent: -0.02, lastUpdate: new Date().toISOString() },
  { pair: 'USD/CNH', bid: 7.2425, ask: 7.2475, mid: 7.2450, change: 0.0050, changePercent: 0.07, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/SGD', bid: 1.4560, ask: 1.4565, mid: 1.4562, change: 0.0015, changePercent: 0.10, lastUpdate: new Date().toISOString() },
  { pair: 'JPY/SGD', bid: 0.00898, ask: 0.00902, mid: 0.00900, change: 0.00003, changePercent: 0.33, lastUpdate: new Date().toISOString() },
  { pair: 'AUD/SGD', bid: 0.8828, ask: 0.8836, mid: 0.8832, change: -0.0012, changePercent: -0.14, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/SGD', bid: 1.7080, ask: 1.7085, mid: 1.7082, change: 0.0062, changePercent: 0.36, lastUpdate: new Date().toISOString() },
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
          { pair: 'USDSGD', amount: 1500000, rate: 1.3400, usdEquivalent: 1500000, legType: 'Buy Leg' }
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
          { pair: 'EURSGD', amount: 1000000, rate: 1.4580, usdEquivalent: 1456200 }
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
          { pair: 'JPYSGD', amount: 15000000, rate: 0.00900, usdEquivalent: 135000 }
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
          { pair: 'AUDSGD', amount: 500000, rate: 0.8832, usdEquivalent: 441600 }
        ]
      },
      // GBP/SGD - Direct pair (G10xG10)
      {
        id: 'TRD-0010',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-061',
        originalPair: 'GBP/SGD',
        originalAmount: -300000, // Selling 300K GBP (negative)
        isExoticPair: false,
        usdLegs: [
          { pair: 'GBPSGD', amount: -300000, rate: 1.7082, usdEquivalent: -512460 }
        ]
      },
      // CNH/SGD - Exotic pair (non-G10 requires USD routing)
      {
        id: 'TRD-0011',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'CNH/SGD',
        originalAmount: 3000000, // 3M CNH
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required',
        netUsdExposure: 414079,
        usdLegs: [
          { pair: 'USDCNH', amount: -3000000, rate: 7.2450, usdEquivalent: 414079, legType: 'Sell Leg' },
          { pair: 'USDSGD', amount: 414079, rate: 1.3400, usdEquivalent: 414079, legType: 'Buy Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0002',
    currency: 'EUR',
    liquidityProvider: 'HSBC',
    netPosition: -1800000,
    currentRate: 1.0852,
    mtmValue: -1953360,
    unrealizedPnL: 12240,
    realizedPnL: -3500,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0003',
        tradeDate: new Date(Date.now() - 259200000).toISOString(),
        customerOrder: 'CUST-012',
        originalPair: 'EUR/USD',
        originalAmount: -1800000,
        usdLegs: [
          { pair: 'EURUSD', amount: -1800000, rate: 1.0920, usdEquivalent: -1965600 }
        ]
      }
    ]
  },
  {
    id: 'POS-0003',
    currency: 'GBP',
    liquidityProvider: 'Standard Chartered',
    netPosition: 1200000,
    currentRate: 1.2722,
    mtmValue: 1526640,
    unrealizedPnL: 8640,
    realizedPnL: 2100,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0004',
        tradeDate: new Date(Date.now() - 345600000).toISOString(),
        customerOrder: 'CUST-018',
        originalPair: 'GBP/USD',
        originalAmount: 1200000,
        usdLegs: [
          { pair: 'GBPUSD', amount: 1200000, rate: 1.2650, usdEquivalent: 1518000 }
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
          { pair: 'AUDUSD', amount: -950000, rate: 0.6620, usdEquivalent: -628900, legType: 'Sell Leg' }
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
          { pair: 'AUDSGD', amount: 500000, rate: 0.8832, usdEquivalent: 441600 }
        ]
      }
    ]
  },
  {
    id: 'POS-0005',
    currency: 'JPY',
    liquidityProvider: 'UOB',
    netPosition: -11800000, // Negative from JPY/SGD exotic trade
    currentRate: 149.27,
    mtmValue: -79034,
    unrealizedPnL: -1204,
    realizedPnL: 2100,
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
          { pair: 'USDJPY', amount: 3200000, rate: 148.80, usdEquivalent: 21505, legType: 'Buy Leg' }
        ]
      },
      // Corresponding JPY/SGD trade - Direct pair (G10xG10)
      {
        id: 'TRD-0008-JPY',
        tradeDate: new Date(Date.now() - 259200000).toISOString(),
        customerOrder: 'CUST-048',
        originalPair: 'JPY/SGD',
        originalAmount: -15000000, // Selling 15M JPY
        isExoticPair: false,
        usdLegs: [
          { pair: 'JPYSGD', amount: -15000000, rate: 0.00900, usdEquivalent: -135000 }
        ]
      }
    ]
  },
  {
    id: 'POS-0006',
    currency: 'MYR',
    liquidityProvider: 'Citibank',
    netPosition: 4500000,
    currentRate: 4.4650,
    mtmValue: 1007826,
    unrealizedPnL: 5200,
    realizedPnL: 3100,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0007',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'MYR/HKD',
        originalAmount: 4500000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required',
        netUsdExposure: 1011236,
        usdLegs: [
          { pair: 'USDMYR', amount: 4500000, rate: 4.4500, usdEquivalent: 1011236, legType: 'Buy Leg' },
          { pair: 'USDHKD', amount: -1011236, rate: 7.8200, usdEquivalent: -1011236, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  // CNH position from exotic CNH/SGD trade
  {
    id: 'POS-0007',
    currency: 'CNH',
    liquidityProvider: 'HSBC',
    netPosition: -3000000, // Negative from selling CNH
    currentRate: 7.2450,
    mtmValue: -414079,
    unrealizedPnL: -2100,
    realizedPnL: 1200,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0011-CNH',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'CNH/SGD',
        originalAmount: -3000000, // Selling 3M CNH
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required',
        netUsdExposure: -414079,
        usdLegs: [
          { pair: 'USDCNH', amount: -3000000, rate: 7.2450, usdEquivalent: -414079, legType: 'Sell Leg' },
          { pair: 'USDSGD', amount: 414079, rate: 1.3400, usdEquivalent: 414079, legType: 'Buy Leg' }
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
