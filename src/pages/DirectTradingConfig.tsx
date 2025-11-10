import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyPairMatrix } from '@/components/CurrencyPairMatrix';
import { DefaultRoutingDialog } from '@/components/DefaultRoutingDialog';
import { useDirectTradingConfig } from '@/hooks/useDirectTradingConfig';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { G10_CURRENCIES, normalizePair } from '@/data/mockData';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DirectTradingConfig = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config, availableCurrencies, updateConfig, checkCurrencyHasPositions } = useDirectTradingConfig();
  
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(config.currencies);
  const [stagedPairConfigurations, setStagedPairConfigurations] = useState<Record<string, 'direct' | 'exotic'>>(
    config.pairConfigurations
  );
  const [hiddenCurrencies, setHiddenCurrencies] = useState<string[]>(config.hiddenCurrencies);
  const [currencyToAdd, setCurrencyToAdd] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showRoutingDialog, setShowRoutingDialog] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string>('');

  // Track modified pairs
  const modifiedPairs = useMemo(() => {
    const modified = new Set<string>();
    const allPairs = new Set([
      ...Object.keys(config.pairConfigurations),
      ...Object.keys(stagedPairConfigurations),
    ]);

    allPairs.forEach(pair => {
      const originalStatus = config.pairConfigurations[pair];
      const stagedStatus = stagedPairConfigurations[pair];
      if (originalStatus !== stagedStatus) {
        modified.add(pair);
      }
    });

    return modified;
  }, [config.pairConfigurations, stagedPairConfigurations]);

  const hasCurrencyChanges = useMemo(() => {
    return JSON.stringify(selectedCurrencies.sort()) !== JSON.stringify(config.currencies.sort());
  }, [selectedCurrencies, config.currencies]);

  const hasPairChanges = useMemo(() => {
    return modifiedPairs.size > 0;
  }, [modifiedPairs]);

  const handleAddCurrency = () => {
    if (!currencyToAdd) return;
    
    if (selectedCurrencies.includes(currencyToAdd)) {
      toast({
        title: 'Already Added',
        description: `${currencyToAdd} is already in the configuration`,
        variant: 'destructive',
      });
      return;
    }

    // Check if currency has positions
    if (!checkCurrencyHasPositions(currencyToAdd)) {
      const warningMsg = `${currencyToAdd} has no active positions in the system`;
      setWarnings(prev => [...prev, warningMsg]);
      toast({
        title: 'Warning',
        description: warningMsg,
        variant: 'default',
      });
    }

    // Show routing dialog
    setPendingCurrency(currencyToAdd);
    setShowRoutingDialog(true);
    setCurrencyToAdd('');
  };

  const handleRoutingConfirm = (defaultRouting: 'direct' | 'exotic') => {
    // Add currency
    const newCurrencies = [...selectedCurrencies, pendingCurrency].sort();
    setSelectedCurrencies(newCurrencies);

    // Remove from hidden if it was there
    setHiddenCurrencies(prev => prev.filter(c => c !== pendingCurrency));

    // Create pair configurations for all pairs involving the new currency
    const updatedPairConfigs = { ...stagedPairConfigurations };
    selectedCurrencies.forEach(existingCurrency => {
      const pair = normalizePair(pendingCurrency, existingCurrency);
      updatedPairConfigs[pair] = defaultRouting;
    });
    setStagedPairConfigurations(updatedPairConfigs);

    setShowRoutingDialog(false);
    setPendingCurrency('');

    toast({
      title: 'Currency Added',
      description: `${pendingCurrency} added with ${defaultRouting} routing for all pairs`,
    });
  };

  const handleRoutingCancel = () => {
    setShowRoutingDialog(false);
    setPendingCurrency('');
  };

  const handleRemoveCurrency = (currency: string) => {
    setSelectedCurrencies(prev => prev.filter(c => c !== currency));
    setHiddenCurrencies(prev => [...prev, currency]);
    setWarnings(prev => prev.filter(w => !w.includes(currency)));
    
    toast({
      title: 'Currency Hidden',
      description: `${currency} removed from matrix (pair configurations retained)`,
    });
  };

  const handlePairToggle = (base: string, quote: string) => {
    const pair = normalizePair(base, quote);
    const currentStatus = stagedPairConfigurations[pair] || 'exotic';
    const newStatus = currentStatus === 'direct' ? 'exotic' : 'direct';
    
    setStagedPairConfigurations(prev => ({
      ...prev,
      [pair]: newStatus,
    }));
  };

  const handleSaveCurrencies = () => {
    if (selectedCurrencies.length < 2) {
      toast({
        title: 'Validation Error',
        description: 'At least 2 currencies are required for direct trading configuration',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedCurrencies.includes('USD')) {
      toast({
        title: 'Warning',
        description: 'USD is recommended to be included in the configuration',
        variant: 'default',
      });
    }

    updateConfig(selectedCurrencies, stagedPairConfigurations, hiddenCurrencies);
    setWarnings([]);
    
    toast({
      title: 'Currency Selection Saved',
      description: `${selectedCurrencies.length} currencies configured. Logged to audit trail.`,
    });
  };

  const handleSavePairMatrix = () => {
    updateConfig(selectedCurrencies, stagedPairConfigurations, hiddenCurrencies);
    
    const pairChangesCount = modifiedPairs.size;
    const directCount = Array.from(modifiedPairs).filter(
      pair => stagedPairConfigurations[pair] === 'direct'
    ).length;
    const exoticCount = pairChangesCount - directCount;
    
    toast({
      title: 'Pair Routing Saved',
      description: `${pairChangesCount} pair${pairChangesCount !== 1 ? 's' : ''} updated${directCount > 0 ? ` (${directCount} direct` : ''}${exoticCount > 0 ? `${directCount > 0 ? ', ' : ' ('}${exoticCount} exotic)` : directCount > 0 ? ')' : ''}. Logged to audit trail.`,
    });
  };

  const handleReset = () => {
    setSelectedCurrencies([...G10_CURRENCIES]);
    
    // Reset to G10 pair configurations (all direct)
    const g10PairConfigs: Record<string, 'direct' | 'exotic'> = {};
    for (let i = 0; i < G10_CURRENCIES.length; i++) {
      for (let j = i + 1; j < G10_CURRENCIES.length; j++) {
        const pair = normalizePair(G10_CURRENCIES[i], G10_CURRENCIES[j]);
        g10PairConfigs[pair] = 'direct';
      }
    }
    setStagedPairConfigurations(g10PairConfigs);
    setHiddenCurrencies([]);
    setWarnings([]);
    
    toast({
      title: 'Reset to G10',
      description: 'Configuration reset to G10 currencies with all pairs as direct',
    });
  };

  const handleCancel = () => {
    setSelectedCurrencies(config.currencies);
    setStagedPairConfigurations(config.pairConfigurations);
    setHiddenCurrencies(config.hiddenCurrencies);
    setWarnings([]);
  };

  const availableToAdd = availableCurrencies.filter(
    c => !selectedCurrencies.includes(c) && !hiddenCurrencies.includes(c)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Direct Trading Configuration</h1>
            <p className="text-muted-foreground mt-1">
              Configure currency pairs and their routing behavior
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {selectedCurrencies.length} {selectedCurrencies.length === 1 ? 'Currency' : 'Currencies'}
        </Badge>
      </div>

      {warnings.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {warnings.map((warning, idx) => (
                <p key={idx} className="text-sm">{warning}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Currency Selection</CardTitle>
          <CardDescription>
            Add or remove currencies from the configuration. Set default routing for new currency pairs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Select value={currencyToAdd} onValueChange={setCurrencyToAdd}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select currency to add..." />
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    All available currencies added
                  </div>
                ) : (
                  availableToAdd.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button onClick={handleAddCurrency} disabled={!currencyToAdd}>
              Add Currency
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to G10
            </Button>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Currently Configured Currencies</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCurrencies.map((currency) => (
                <Badge
                  key={currency}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm flex items-center gap-2"
                >
                  {currency}
                  <button
                    onClick={() => handleRemoveCurrency(currency)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Last modified by <strong>{config.lastModifiedBy}</strong> on{' '}
              {new Date(config.lastModifiedAt).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={!hasCurrencyChanges && !hasPairChanges}>
                Cancel
              </Button>
              <Button onClick={handleSaveCurrencies} disabled={!hasCurrencyChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Currency Selection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Currency Pair Matrix</CardTitle>
          <CardDescription>
            Click any cell to toggle between Direct and Exotic routing for that pair
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPairChanges && (
            <Alert className="border-primary/50 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                <span className="text-primary">
                  <strong>{modifiedPairs.size} pair{modifiedPairs.size !== 1 ? 's' : ''}</strong> modified in matrix. 
                  Save changes below to apply.
                </span>
              </AlertDescription>
            </Alert>
          )}
          <CurrencyPairMatrix 
            currencies={selectedCurrencies} 
            pairConfigurations={stagedPairConfigurations}
            modifiedPairs={modifiedPairs}
            onPairToggle={handlePairToggle}
            highlightChanges={hasPairChanges} 
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button onClick={handleSavePairMatrix} disabled={!hasPairChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impact Summary</CardTitle>
          <CardDescription>Understanding the configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-direct" />
                <h4 className="font-semibold text-sm">Direct Pairs</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Trade directly without USD decomposition. Creates single position entries but still calculates USD
                equivalent for MTM reporting.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-exotic" />
                <h4 className="font-semibold text-sm">Exotic Pairs (USD Routing)</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Route through two USD legs, creating intermediate USD exposure and separate position entries for
                each leg.
              </p>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Configuration applies to NEW trades only. Existing positions remain
              unchanged. All changes are logged to the audit trail for compliance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <DefaultRoutingDialog
        open={showRoutingDialog}
        currency={pendingCurrency}
        existingCurrencies={selectedCurrencies}
        onConfirm={handleRoutingConfirm}
        onCancel={handleRoutingCancel}
      />
    </div>
  );
};

export default DirectTradingConfig;
