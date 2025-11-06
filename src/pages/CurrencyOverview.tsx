import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
          <CardTitle>Underlying Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {allTrades.map((trade) => (
            <div key={trade.id} className="border rounded-lg overflow-hidden">
              {/* Original Trade Record */}
              <div className="bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Original Trade: {trade.id}</h4>
                  <Badge variant="outline">{trade.lpName}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Timestamp</p>
                    <p className="font-medium">{new Date(trade.tradeDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Account Name</p>
                    <p className="font-medium">{trade.customerOrder}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Currency Pair</p>
                    <p className="font-medium">{trade.originalPair}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Sell Amount</p>
                    <p className="font-medium">
                      {trade.originalAmount < 0 
                        ? `${Math.abs(trade.originalAmount).toLocaleString()} ${trade.originalPair.split('/')[0]}`
                        : '-'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Buy Amount</p>
                    <p className="font-medium">
                      {trade.originalAmount > 0
                        ? `${trade.originalAmount.toLocaleString()} ${trade.originalPair.split('/')[0]}`
                        : '-'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Rate</p>
                    <p className="font-medium">{trade.usdLegs[0]?.rate.toFixed(4) || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Split USD Leg Records */}
              <div className="p-4">
                <h5 className="text-sm font-semibold mb-3 text-muted-foreground">USD-Denominated Breakdown</h5>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency Pair</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Base Currency Position</TableHead>
                      <TableHead>Quote Currency Position</TableHead>
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
                      const quotePosition = -leg.usdEquivalent;

                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{leg.pair}</TableCell>
                          <TableCell className="font-mono">{leg.rate.toFixed(4)}</TableCell>
                          <TableCell className={basePosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {base}: {basePosition >= 0 ? '+' : ''}{formatCurrency(basePosition)}
                          </TableCell>
                          <TableCell className={quotePosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {quote}: {quotePosition >= 0 ? '+' : ''}{formatCurrency(quotePosition)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
