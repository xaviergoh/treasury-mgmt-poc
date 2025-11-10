import { CurrencyPairStatus } from '@/types/treasury';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { normalizePair } from '@/data/mockData';

interface CurrencyPairMatrixProps {
  currencies: string[];
  pairConfigurations: Record<string, 'direct' | 'exotic'>;
  modifiedPairs?: Set<string>;
  onPairToggle?: (base: string, quote: string) => void;
  highlightChanges?: boolean;
}

const computePairStatus = (
  base: string, 
  quote: string, 
  pairConfigurations: Record<string, 'direct' | 'exotic'>
): CurrencyPairStatus => {
  if (base === quote) {
    return {
      base,
      quote,
      isDirect: false,
      reason: 'Same currency',
    };
  }

  const pair = normalizePair(base, quote);
  const isDirect = pairConfigurations[pair] === 'direct';
  
  return {
    base,
    quote,
    isDirect,
    reason: isDirect
      ? 'Direct trading - executes without USD decomposition'
      : 'Exotic - routed through two USD legs',
  };
};

export const CurrencyPairMatrix = ({ 
  currencies, 
  pairConfigurations,
  modifiedPairs = new Set(),
  onPairToggle,
  highlightChanges = false 
}: CurrencyPairMatrixProps) => {
  // Sort currencies with USD first if present
  const sortedCurrencies = [...currencies].sort((a, b) => {
    if (a === 'USD') return -1;
    if (b === 'USD') return 1;
    return a.localeCompare(b);
  });

  const handleCellClick = (base: string, quote: string) => {
    if (base !== quote && onPairToggle) {
      onPairToggle(base, quote);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
          {modifiedPairs.size > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary ring-2 ring-primary/30" />
              <span className="text-primary font-semibold">Unsaved</span>
            </div>
          )}
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
                    const status = computePairStatus(base, quote, pairConfigurations);
                    const pair = normalizePair(base, quote);
                    const isModified = modifiedPairs.has(pair);
                    const isClickable = base !== quote && onPairToggle;
                    
                    return (
                      <TooltipProvider key={`${base}-${quote}`} delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <td
                              onClick={() => handleCellClick(base, quote)}
                              className={`px-3 py-2 text-center text-xs transition-all ${
                                base === quote
                                  ? 'bg-muted cursor-not-allowed'
                                  : status.isDirect
                                  ? 'bg-direct/10 hover:bg-direct/20 cursor-pointer border-direct/30'
                                  : 'bg-exotic/10 hover:bg-exotic/20 cursor-pointer border-exotic/30'
                              } ${highlightChanges ? 'animate-pulse' : ''} ${
                                isModified ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                              } ${isClickable ? 'active:scale-95' : ''}`}
                            >
                              {base === quote ? (
                                <span className="text-muted-foreground">—</span>
                              ) : (
                                <Badge
                                  variant={status.isDirect ? 'default' : 'secondary'}
                                  className={`${
                                    status.isDirect
                                      ? 'bg-direct text-direct-foreground hover:bg-direct/80'
                                      : 'bg-exotic text-exotic-foreground hover:bg-exotic/80'
                                  } ${isModified ? 'ring-1 ring-primary' : ''}`}
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
                              {isModified && (
                                <p className="text-xs text-primary font-semibold mt-1">● Unsaved change</p>
                              )}
                              {onPairToggle && base !== quote && (
                                <p className="text-xs text-muted-foreground mt-1">Click to toggle routing</p>
                              )}
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

      <div className="text-xs text-muted-foreground space-y-2">
        <p>
          <strong>Direct pairs</strong> trade without USD decomposition. <strong>Exotic pairs</strong> are routed
          through two USD legs.
        </p>
        {onPairToggle && (
          <p className="text-primary">
            <strong>Interactive mode:</strong> Click any cell to toggle between Direct and Exotic routing.
          </p>
        )}
      </div>
    </div>
  );
};
