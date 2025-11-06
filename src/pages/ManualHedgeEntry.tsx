import { useState } from "react";
import { mockHedges, mockMarketRates } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

const DUAL_AUTH_THRESHOLD = 1000000; // $1M

export default function ManualHedgeEntry() {
  const [hedges] = useState(mockHedges);
  const [formData, setFormData] = useState({
    currencyPair: '',
    type: '',
    amount: '',
    rate: '',
    liquidityProvider: '',
    externalReference: '',
  });

  const requiresDualAuth = Number(formData.amount) >= DUAL_AUTH_THRESHOLD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currencyPair || !formData.type || !formData.amount || !formData.rate || !formData.liquidityProvider) {
      toast.error("Please fill in all required fields");
      return;
    }

    const currentRate = mockMarketRates.find(r => r.pair === formData.currencyPair)?.mid;
    if (currentRate) {
      const rateDiff = Math.abs((Number(formData.rate) - currentRate) / currentRate * 100);
      if (rateDiff > 1) {
        toast.warning("Rate differs significantly from market rate", {
          description: `Your rate: ${formData.rate}, Market: ${currentRate.toFixed(4)}`
        });
      }
    }

    if (requiresDualAuth) {
      toast.info("Hedge submitted for dual authorization", {
        description: "Large hedge requires two-level approval"
      });
    } else {
      toast.success("Hedge entered successfully", {
        description: "Hedge has been recorded and will be matched automatically"
      });
    }

    setFormData({
      currencyPair: '',
      type: '',
      amount: '',
      rate: '',
      liquidityProvider: '',
      externalReference: '',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manual Hedge Entry</h2>
        <p className="text-muted-foreground">Record hedges executed outside the platform</p>
      </div>

      <Tabs defaultValue="entry">
        <TabsList>
          <TabsTrigger value="entry">New Hedge Entry</TabsTrigger>
          <TabsTrigger value="list">Hedge List ({hedges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hedge Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currencyPair">Currency Pair *</Label>
                    <Select
                      value={formData.currencyPair}
                      onValueChange={(value) => setFormData({ ...formData, currencyPair: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency pair" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockMarketRates.map(rate => (
                          <SelectItem key={rate.pair} value={rate.pair}>{rate.pair}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Hedge Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hedge type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spot">Spot</SelectItem>
                        <SelectItem value="Forward">Forward</SelectItem>
                        <SelectItem value="Swap">Swap</SelectItem>
                        <SelectItem value="NDF">NDF</SelectItem>
                        <SelectItem value="Option">Option</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                    {requiresDualAuth && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Requires dual authorization (≥$1M)</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Exchange Rate *</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 1.3400"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lp">Liquidity Provider *</Label>
                    <Select
                      value={formData.liquidityProvider}
                      onValueChange={(value) => setFormData({ ...formData, liquidityProvider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select LP" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Citibank">Citibank</SelectItem>
                        <SelectItem value="HSBC">HSBC</SelectItem>
                        <SelectItem value="Standard Chartered">Standard Chartered</SelectItem>
                        <SelectItem value="DBS">DBS</SelectItem>
                        <SelectItem value="UOB">UOB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">External Reference</Label>
                    <Input
                      id="reference"
                      placeholder="e.g., FWD-2024-001"
                      value={formData.externalReference}
                      onChange={(e) => setFormData({ ...formData, externalReference: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg">
                  Submit Hedge Entry
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Recorded Hedges</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hedge ID</TableHead>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>LP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hedges.map((hedge) => (
                    <TableRow key={hedge.id}>
                      <TableCell className="font-medium">{hedge.id}</TableCell>
                      <TableCell>{hedge.currencyPair}</TableCell>
                      <TableCell>{hedge.type}</TableCell>
                      <TableCell className="text-right">{hedge.amount.toLocaleString()}</TableCell>
                      <TableCell>{hedge.rate.toFixed(4)}</TableCell>
                      <TableCell>{hedge.liquidityProvider}</TableCell>
                      <TableCell>
                        <Badge variant={
                          hedge.status === 'Fully Matched' ? 'default' :
                          hedge.status === 'Pending' ? 'secondary' : 'outline'
                        }>
                          {hedge.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(hedge.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
