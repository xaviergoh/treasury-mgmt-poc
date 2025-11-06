import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockPositions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

type CurrencyDisplay = 'USD' | 'SGD';

export default function PositionsDashboard() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<CurrencyDisplay>('USD');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [lpFilter, setLpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof typeof mockPositions[0] | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const SGD_RATE = 1.3422;

  const convertToDisplayCurrency = (usdAmount: number) => {
    return currency === 'SGD' ? usdAmount * SGD_RATE : usdAmount;
  };

  const filteredAndSortedPositions = useMemo(() => {
    let filtered = mockPositions.filter(pos => {
      if (currencyFilter && !pos.currency.toLowerCase().includes(currencyFilter.toLowerCase())) return false;
      if (lpFilter && !pos.liquidityProvider.toLowerCase().includes(lpFilter.toLowerCase())) return false;
      if (statusFilter !== 'all' && pos.status !== statusFilter) return false;
      return true;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return filtered;
  }, [currencyFilter, lpFilter, statusFilter, sortField, sortDirection]);

  const totals = useMemo(() => {
    const totalMTM = mockPositions.reduce((sum, pos) => sum + pos.mtmValue, 0);
    const totalRealized = mockPositions.reduce((sum, pos) => sum + pos.realizedPnL, 0);
    const totalUnrealized = mockPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
    const totalPnL = totalRealized + totalUnrealized;

    return { totalMTM, totalRealized, totalUnrealized, totalPnL };
  }, []);

  const handleSort = (field: keyof typeof mockPositions[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (amount: number) => {
    const displayAmount = convertToDisplayCurrency(amount);
    return `${currency} ${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPnL = (amount: number) => {
    const displayAmount = convertToDisplayCurrency(amount);
    const formatted = displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return displayAmount >= 0 ? `+${formatted}` : formatted;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Positions Dashboard</h2>
          <p className="text-muted-foreground">Real-time FX position tracking with MTM valuation</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={currency === 'USD' ? 'default' : 'outline'}
            onClick={() => setCurrency('USD')}
          >
            USD
          </Button>
          <Button
            variant={currency === 'SGD' ? 'default' : 'outline'}
            onClick={() => setCurrency('SGD')}
          >
            SGD
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MTM Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalMTM)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realized P&L</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.totalRealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPnL(totals.totalRealized)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
            {totals.totalUnrealized >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.totalUnrealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPnL(totals.totalUnrealized)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totals.totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPnL(totals.totalPnL)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Currency..."
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
            />
            <Input
              placeholder="Liquidity Provider..."
              value={lpFilter}
              onChange={(e) => setLpFilter(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Hedged">Hedged</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setCurrencyFilter('');
              setLpFilter('');
              setStatusFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Positions ({filteredAndSortedPositions.length})</h3>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleSort('netPosition')}
            >
              Sort by Position {sortField === 'netPosition' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleSort('mtmValue')}
            >
              Sort by MTM {sortField === 'mtmValue' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleSort('unrealizedPnL')}
            >
              Sort by P&L {sortField === 'unrealizedPnL' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedPositions.map((position) => (
            <Card 
              key={position.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2"
              onClick={() => navigate(`/positions/${position.currency}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{position.currency}</span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{position.currency}</CardTitle>
                      <p className="text-xs text-muted-foreground">Click for details</p>
                    </div>
                  </div>
                  <Badge variant={position.status === 'Open' ? 'default' : 'secondary'}>
                    {position.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Net Position</p>
                    <p className="text-lg font-bold font-mono">
                      {position.netPosition >= 0 ? '+' : ''}{position.netPosition.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Reuters Rate</p>
                    <p className="text-lg font-bold font-mono">{position.currentRate.toFixed(4)}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">MTM Value</span>
                    <span className="font-semibold font-mono">{formatCurrency(position.mtmValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unrealized P&L</span>
                    <span className={`font-bold font-mono ${position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPnL(position.unrealizedPnL)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
