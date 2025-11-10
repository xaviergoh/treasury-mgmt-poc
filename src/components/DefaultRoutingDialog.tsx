import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface DefaultRoutingDialogProps {
  open: boolean;
  currency: string;
  existingCurrencies: string[];
  onConfirm: (defaultRouting: 'direct' | 'exotic') => void;
  onCancel: () => void;
}

export const DefaultRoutingDialog = ({
  open,
  currency,
  existingCurrencies,
  onConfirm,
  onCancel,
}: DefaultRoutingDialogProps) => {
  const [selectedRouting, setSelectedRouting] = useState<'direct' | 'exotic'>('exotic');

  const pairsCount = existingCurrencies.length;

  const handleConfirm = () => {
    onConfirm(selectedRouting);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Default Routing for {currency}</DialogTitle>
          <DialogDescription>
            Choose how {currency} pairs should be routed by default. This will apply to all {pairsCount} pairs
            involving {currency}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedRouting} onValueChange={(v) => setSelectedRouting(v as 'direct' | 'exotic')}>
            <div className="space-y-3">
              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                  selectedRouting === 'direct'
                    ? 'border-direct bg-direct/5'
                    : 'border-border hover:border-direct/50'
                }`}
              >
                <RadioGroupItem value="direct" id="direct" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="direct" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-direct" />
                    <span className="font-semibold">Direct Trading</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Trade without USD decomposition. Creates single position entries. Suitable for major currency
                    pairs with good liquidity.
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 transition-all ${
                  selectedRouting === 'exotic'
                    ? 'border-exotic bg-exotic/5'
                    : 'border-border hover:border-exotic/50'
                }`}
              >
                <RadioGroupItem value="exotic" id="exotic" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="exotic" className="flex items-center gap-2 cursor-pointer">
                    <AlertCircle className="h-4 w-4 text-exotic" />
                    <span className="font-semibold">Exotic (USD Routing)</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Route through two USD legs. Creates intermediate USD exposure and separate position entries for
                    each leg. Standard for less liquid pairs.
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="text-muted-foreground">
              <strong>Note:</strong> You can change individual pair routing later by clicking cells in the Currency
              Pair Matrix.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm & Add {currency}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
