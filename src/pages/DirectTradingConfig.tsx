import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyPairMatrix } from '@/components/CurrencyPairMatrix';
import { useDirectTradingConfig } from '@/hooks/useDirectTradingConfig';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { G10_CURRENCIES } from '@/data/mockData';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DirectTradingConfig = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config, availableCurrencies, updateConfig, checkCurrencyHasPositions } = useDirectTradingConfig();
  
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(config.currencies);
  const [currencyToAdd, setCurrencyToAdd] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(selectedCurrencies.sort()) !== JSON.stringify(config.currencies.sort());
  }, [selectedCurrencies, config.currencies]);

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

    setSelectedCurrencies(prev => [...prev, currencyToAdd].sort());
    setCurrencyToAdd('');
  };

  const handleRemoveCurrency = (currency: string) => {
    setSelectedCurrencies(prev => prev.filter(c => c !== currency));
    setWarnings(prev => prev.filter(w => !w.includes(currency)));
  };

  const handleSave = () => {
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

    updateConfig(selectedCurrencies);
    setWarnings([]);
    
    toast({
      title: 'Configuration Saved',
      description: `Direct Trading Currencies updated successfully. Configuration logged to audit trail.`,
    });
  };

  const handleReset = () => {
    setSelectedCurrencies([...G10_CURRENCIES]);
    setWarnings([]);
    toast({
      title: 'Reset to G10',
      description: 'Configuration reset to G10 currencies',
    });
  };

  const handleCancel = () => {
    setSelectedCurrencies(config.currencies);
    setWarnings([]);
  };

  const availableToAdd = availableCurrencies.filter(c => !selectedCurrencies.includes(c));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Direct Trading Currencies</h1>
            <p className="text-muted-foreground mt-1">
              Configure which currencies can trade directly without USD decomposition
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
            Add or remove currencies from the Direct Trading configuration. Changes apply to new trades only.
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

          {hasUnsavedChanges && (
            <Alert className="border-primary/50 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                You have unsaved changes. Click Save to apply or Cancel to discard.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Last modified by <strong>{config.lastModifiedBy}</strong> on{' '}
              {new Date(config.lastModifiedAt).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={!hasUnsavedChanges}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real-Time Currency Pair Matrix</CardTitle>
          <CardDescription>
            Visual preview showing which currency pairs will trade directly vs. requiring USD decomposition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyPairMatrix currencies={selectedCurrencies} highlightChanges={hasUnsavedChanges} />
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
                When both currencies in a pair are in the configuration, the trade executes directly without USD
                decomposition. Creates single position entries but still calculates USD equivalent for MTM reporting.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-exotic" />
                <h4 className="font-semibold text-sm">Exotic Pairs</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                When one or both currencies are not in the configuration, the trade is decomposed into two USD legs,
                creating intermediate USD exposure and separate position entries for each leg.
              </p>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This configuration applies to NEW trades only. Existing positions and trades
              remain unchanged. Changes are logged to the audit trail for compliance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectTradingConfig;
