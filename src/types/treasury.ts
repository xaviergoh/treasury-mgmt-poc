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
}

export interface UsdLeg {
  pair: string; // e.g., "USDMYR" or "USDHKD"
  amount: number;
  rate: number;
  usdEquivalent: number;
  legType?: 'Buy Leg' | 'Sell Leg'; // clarifies direction for exotic pair decomposition
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
  currencies: string[];
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
