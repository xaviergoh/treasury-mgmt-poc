export interface Position {
  id: string;
  currencyPair: string;
  liquidityProvider: string;
  netPosition: number;
  averageRate: number;
  currentRate: number;
  mtmValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  status: 'Open' | 'Closed' | 'Hedged';
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
  eventType: 'Position Reset' | 'Hedge Entry' | 'Approval' | 'Rate Update';
  description: string;
  user: string;
  details: Record<string, any>;
  status: string;
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
