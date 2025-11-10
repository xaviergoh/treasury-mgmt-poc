import { CurrencyPairStatus } from '@/types/treasury';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CurrencyPairMatrixProps {
  currencies: string[];
  highlightChanges?: boolean;
}

const computePairStatus = (base: string, quote: string, currencies: string[]): CurrencyPairStatus => {
  if (base === quote) {
    return {
      base,
      quote,
      isDirect: false,
      reason: 'Same currency',
    };
  }

  const isDirect = currencies.includes(base) && currencies.includes(quote);
  return {
    base,
    quote,
    isDirect,
    reason: isDirect
      ? 'Both currencies in Direct Trading Config - trades directly without USD decomposition'
      : 'Requires USD decomposition via two legs',
  };
};

export const CurrencyPairMatrix = ({ currencies, highlightChanges = false }: CurrencyPairMatrixProps) => {
  // Sort currencies with USD first if present
  const sortedCurrencies = [...currencies].sort((a, b) => {
    if (a === 'USD') return -1;
    if (b === 'USD') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-semibold text-foreground">Currency Pair Matrix</h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-direct border border-direct" />
            <span className="text-muted-foreground">Direct</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-exotic border border-exotic" />
            <span className="text-muted-foreground">Exotic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-muted border border-border" />
            <span className="text-muted-foreground">N/A</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-muted px-3 py-2 text-left text-xs font-semibold text-muted-foreground border-r border-border">
                  Base / Quote
                </th>
                {sortedCurrencies.map((quote) => (
                  <th
                    key={quote}
                    className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground bg-muted"
                  >
                    {quote}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {sortedCurrencies.map((base) => (
                <tr key={base} className="hover:bg-accent/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-muted px-3 py-2 text-xs font-semibold text-foreground border-r border-border">
                    {base}
                  </td>
                  {sortedCurrencies.map((quote) => {
                    const status = computePairStatus(base, quote, currencies);
                    return (
                      <TooltipProvider key={`${base}-${quote}`} delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <td
                              className={`px-3 py-2 text-center text-xs transition-all ${
                                base === quote
                                  ? 'bg-muted cursor-not-allowed'
                                  : status.isDirect
                                  ? 'bg-direct/10 hover:bg-direct/20 cursor-pointer border-direct/30'
                                  : 'bg-exotic/10 hover:bg-exotic/20 cursor-pointer border-exotic/30'
                              } ${highlightChanges ? 'animate-pulse' : ''}`}
                            >
                              {base === quote ? (
                                <span className="text-muted-foreground">—</span>
                              ) : (
                                <Badge
                                  variant={status.isDirect ? 'default' : 'secondary'}
                                  className={
                                    status.isDirect
                                      ? 'bg-direct text-direct-foreground hover:bg-direct/80'
                                      : 'bg-exotic text-exotic-foreground hover:bg-exotic/80'
                                  }
                                >
                                  {status.isDirect ? 'Direct' : 'Exotic'}
                                </Badge>
                              )}
                            </td>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">
                                {base}/{quote}
                              </p>
                              <p className="text-xs text-muted-foreground">{status.reason}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          <strong>Direct pairs</strong> trade without USD decomposition. <strong>Exotic pairs</strong> are routed
          through two USD legs.
        </p>
      </div>
    </div>
  );
};
