import { useState, useEffect } from "react";
import { mockMarketRates, mockPositions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function MTMValuation() {
  const [rates, setRates] = useState(mockMarketRates);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate rate updates every 2 minutes
      setRates(prevRates => prevRates.map(rate => ({
        ...rate,
        mid: rate.mid + (Math.random() - 0.5) * 0.01,
        change: (Math.random() - 0.5) * 0.02,
        changePercent: (Math.random() - 0.5) * 0.5,
        lastUpdate: new Date().toISOString(),
      })));
      setLastUpdate(new Date());
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  const getPositionsByPair = (pair: string) => {
    return mockPositions.filter(pos => pos.currencyPair === pair);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">MTM Valuation</h2>
          <p className="text-muted-foreground">Real-time market rates and position valuations</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
              <div className="text-sm">
                <div className="font-medium">Rate Source: Reuters Feed</div>
                <div className="text-muted-foreground">Last Update: {lastUpdate.toLocaleTimeString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {rates.map((rate) => {
          const positions = getPositionsByPair(rate.pair);
          const totalExposure = positions.reduce((sum, pos) => sum + Math.abs(pos.netPosition), 0);
          const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);

          return (
            <Card key={rate.pair}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{rate.pair}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant={rate.change >= 0 ? "default" : "destructive"}>
                      {rate.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {rate.changePercent >= 0 ? '+' : ''}{rate.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="text-4xl font-bold">{rate.mid.toFixed(4)}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Bid</div>
                        <div className="font-medium">{rate.bid.toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Ask</div>
                        <div className="font-medium">{rate.ask.toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Change</div>
                        <div className={`font-medium ${rate.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Updated</div>
                        <div className="font-medium">{new Date(rate.lastUpdate).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Position Summary</h4>
                    {positions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Position ID</TableHead>
                            <TableHead>LP</TableHead>
                            <TableHead className="text-right">Net Position</TableHead>
                            <TableHead className="text-right">Unrealized P&L</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {positions.map(pos => (
                            <TableRow key={pos.id}>
                              <TableCell className="font-medium">{pos.id}</TableCell>
                              <TableCell>{pos.liquidityProvider}</TableCell>
                              <TableCell className="text-right">{pos.netPosition.toLocaleString()}</TableCell>
                              <TableCell className={`text-right ${pos.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {pos.unrealizedPnL >= 0 ? '+' : ''}{pos.unrealizedPnL.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                            <TableCell className="text-right font-semibold">{totalExposure.toLocaleString()}</TableCell>
                            <TableCell className={`text-right font-semibold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-sm text-muted-foreground">No positions for this currency pair</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
