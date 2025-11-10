export interface Position {
  id: string;
  currency: string;
  liquidityProvider: string;
  netPosition: number;
  currentRate: number; // USD rate from Reuters
  mtmValue: number; // USD MTM value
  unrealizedPnL: number;
  realizedPnL: number;
  status: 'Open' | 'Closed' | 'Hedged';
  trades: Trade[];
}

export interface Trade {
  id: string;
  tradeDate: string;
  customerOrder: string;
  originalPair: string; // e.g., "MYR/HKD"
  originalAmount: number;
  usdLegs: UsdLeg[];
  isExoticPair?: boolean; // true if neither currency in the pair is USD
  decompositionReason?: string; // explanation for USD routing
  netUsdExposure?: number; // intermediate USD amount created/consumed
  parentTradeId?: string; // Reference to parent exotic trade if this is a USD leg entry
}

export interface UsdLeg {
  pair: string; // e.g., "USD/MYR" or "USD/HKD"
  buy_amount: number; // Amount being bought (always positive) in local currency
  sell_amount: number; // Amount being sold (always positive) in local currency
  usd_position: number; // Net USD position (positive = long USD, negative = short USD)
  local_position: number; // Net local currency position (with sign)
  rate: number; // Trade execution rate (USD/XXX format)
  legType: 'Buy Leg' | 'Sell Leg'; // Clarifies USD direction (Buy Leg = buying USD, Sell Leg = selling USD)
}

export interface Hedge {
  id: string;
  currencyPair: string;
  type: 'Spot' | 'Forward' | 'Swap' | 'NDF' | 'Option';
  amount: number;
  rate: number;
  liquidityProvider: string;
  externalReference: string;
  status: 'Pending' | 'Approved' | 'Unmatched' | 'Partially Matched' | 'Fully Matched';
  requiresDualAuth: boolean;
  timestamp: string;
}

export interface ResetRequest {
  id: string;
  positionId: string;
  currentPosition: number;
  targetPosition: number;
  reason: string;
  justification: string;
  status: 'Pending' | 'First Approved' | 'Executed' | 'Rejected';
  requestedBy: string;
  requestedAt: string;
  approvals: Approval[];
}

export interface Approval {
  level: 1 | 2;
  approver: string;
  timestamp: string;
  comments: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'Position Reset' | 'Hedge Entry' | 'Approval' | 'Rate Update' | 'Configuration Change';
  description: string;
  user: string;
  details: Record<string, any>;
  status: string;
}

export interface DirectTradingConfig {
  id: string;
  currencies: string[]; // Active currencies shown in matrix
  hiddenCurrencies: string[]; // Removed currencies (configs retained)
  pairConfigurations: Record<string, 'direct' | 'exotic'>; // e.g., "EUR/SGD": "direct"
  lastModifiedBy: string;
  lastModifiedAt: string;
  previousCurrencies?: string[];
}

export interface CurrencyPairStatus {
  base: string;
  quote: string;
  isDirect: boolean;
  reason: string;
}

export interface MarketRate {
  pair: string;
  bid: number;
  ask: number;
  mid: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
}
