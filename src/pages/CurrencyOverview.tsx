import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { mockPositions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CurrencyOverview() {
  const { currency } = useParams<{ currency: string }>();
  const navigate = useNavigate();
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const currencyPositions = useMemo(() => {
    return mockPositions.filter(pos => pos.currency === currency);
  }, [currency]);

  const lpBreakdown = useMemo(() => {
    const breakdown = new Map<string, {
      netPosition: number;
      mtmValue: number;
      unrealizedPnL: number;
      realizedPnL: number;
    }>();

    currencyPositions.forEach(pos => {
      const existing = breakdown.get(pos.liquidityProvider) || {
        netPosition: 0,
        mtmValue: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
      };

      breakdown.set(pos.liquidityProvider, {
        netPosition: existing.netPosition + pos.netPosition,
        mtmValue: existing.mtmValue + pos.mtmValue,
        unrealizedPnL: existing.unrealizedPnL + pos.unrealizedPnL,
        realizedPnL: existing.realizedPnL + pos.realizedPnL,
      });
    });

    return breakdown;
  }, [currencyPositions]);

  const totals = useMemo(() => {
    return currencyPositions.reduce(
      (acc, pos) => ({
        netPosition: acc.netPosition + pos.netPosition,
        mtmValue: acc.mtmValue + pos.mtmValue,
        unrealizedPnL: acc.unrealizedPnL + pos.unrealizedPnL,
        realizedPnL: acc.realizedPnL + pos.realizedPnL,
      }),
      { netPosition: 0, mtmValue: 0, unrealizedPnL: 0, realizedPnL: 0 }
    );
  }, [currencyPositions]);

  const allTrades = useMemo(() => {
    return currencyPositions.flatMap(pos => 
      pos.trades.map(trade => ({ ...trade, positionId: pos.id, lpName: pos.liquidityProvider }))
    );
  }, [currencyPositions]);

  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allTrades.slice(startIndex, endIndex);
  }, [allTrades, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(allTrades.length / itemsPerPage);

  const toggleTradeDetails = (tradeId: string) => {
    setExpandedTrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tradeId)) {
        newSet.delete(tradeId);
      } else {
        newSet.add(tradeId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPnL = (amount: number) => {
    const formatted = formatCurrency(Math.abs(amount));
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  if (!currency || currencyPositions.length === 0) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No positions found for {currency}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{currency} Overview</h2>
          <p className="text-muted-foreground">Detailed position breakdown and underlying transactions</p>
        </div>
      </div>

      {/* Total Balances Section */}
      <Card>
        <CardHeader>
          <CardTitle>Total Balances by Liquidity Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Liquidity Provider</TableHead>
                <TableHead className="text-right">Net Position</TableHead>
                <TableHead className="text-right">MTM Value (USD)</TableHead>
                <TableHead className="text-right">Unrealized P&L</TableHead>
                <TableHead className="text-right">Realized P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(lpBreakdown.entries()).map(([lp, data]) => (
                <TableRow key={lp}>
                  <TableCell className="font-medium">{lp}</TableCell>
                  <TableCell className="text-right font-mono">
                    {data.netPosition >= 0 ? '+' : ''}{formatCurrency(data.netPosition)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    USD {formatCurrency(data.mtmValue)}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${data.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPnL(data.unrealizedPnL)}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${data.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPnL(data.realizedPnL)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Grand Total</TableCell>
                <TableCell className="text-right font-mono">
                  {totals.netPosition >= 0 ? '+' : ''}{formatCurrency(totals.netPosition)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  USD {formatCurrency(totals.mtmValue)}
                </TableCell>
                <TableCell className={`text-right font-mono ${totals.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPnL(totals.unrealizedPnL)}
                </TableCell>
                <TableCell className={`text-right font-mono ${totals.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPnL(totals.realizedPnL)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Underlying Transactions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Underlying Transactions ({allTrades.length})</CardTitle>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Trade ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Sell Amount</TableHead>
                <TableHead>Buy Amount</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>LP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTrades.map((trade) => {
                const isExpanded = expandedTrades.has(trade.id);
                const [baseCcy, quoteCcy] = trade.originalPair.split('/');
                const sellAmount = trade.originalAmount < 0 
                  ? `${Math.abs(trade.originalAmount).toLocaleString()} ${baseCcy}`
                  : '-';
                const buyAmount = trade.originalAmount > 0
                  ? `${trade.originalAmount.toLocaleString()} ${baseCcy}`
                  : '-';
                
                return (
                  <>
                    <TableRow 
                      key={trade.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleTradeDetails(trade.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{trade.id}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(trade.tradeDate).toLocaleDateString()} {new Date(trade.tradeDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>{trade.customerOrder}</TableCell>
                      <TableCell className="font-semibold">{trade.originalPair}</TableCell>
                      <TableCell className="font-mono text-red-600">{sellAmount}</TableCell>
                      <TableCell className="font-mono text-green-600">{buyAmount}</TableCell>
                      <TableCell className="font-mono">{trade.usdLegs[0]?.rate.toFixed(4) || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{trade.lpName}</Badge>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${trade.id}-details`}>
                        <TableCell colSpan={8} className="bg-muted/30 p-0">
                          <div className="p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Currency Pair</TableHead>
                                  <TableHead>Rate</TableHead>
                                  <TableHead>{trade.usdLegs[0] ? (trade.usdLegs[0].pair.startsWith('USD') ? 'USD' : trade.usdLegs[0].pair.substring(0, 3)) : 'Base'} Position</TableHead>
                                  <TableHead>{trade.usdLegs[0] ? (trade.usdLegs[0].pair.startsWith('USD') ? trade.usdLegs[0].pair.substring(3) : 'USD') : 'Quote'} Position</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {trade.usdLegs.map((leg, idx) => {
                                  const [base, quote] = leg.pair.replace('USD', 'USD/').includes('/') 
                                    ? leg.pair.split('/')
                                    : leg.pair.startsWith('USD')
                                    ? ['USD', leg.pair.substring(3)]
                                    : [leg.pair.substring(0, 3), 'USD'];
                                  
                                  const basePosition = leg.amount;
                                  // Calculate actual quote currency position
                                  const quotePosition = -(leg.amount * leg.rate);
                                  
                                  const baseLabel = basePosition > 0 
                                    ? `Long ${formatCurrency(Math.abs(basePosition))}`
                                    : basePosition < 0
                                    ? `Short ${formatCurrency(Math.abs(basePosition))}`
                                    : formatCurrency(0);
                                    
                                  const quoteLabel = quotePosition > 0
                                    ? `Long ${formatCurrency(Math.abs(quotePosition))}`
                                    : quotePosition < 0
                                    ? `Short ${formatCurrency(Math.abs(quotePosition))}`
                                    : formatCurrency(0);

                                  return (
                                    <TableRow key={idx}>
                                      <TableCell className="font-medium">{leg.pair}</TableCell>
                                      <TableCell className="font-mono">{leg.rate.toFixed(4)}</TableCell>
                                      <TableCell className={`font-semibold ${basePosition > 0 ? 'text-green-600' : basePosition < 0 ? 'text-red-600' : ''}`}>
                                        {baseLabel}
                                      </TableCell>
                                      <TableCell className={`font-semibold ${quotePosition > 0 ? 'text-green-600' : quotePosition < 0 ? 'text-red-600' : ''}`}>
                                        {quoteLabel}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
