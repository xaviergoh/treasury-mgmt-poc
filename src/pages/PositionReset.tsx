import { useState } from "react";
import { mockResetRequests, mockPositions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function PositionReset() {
  const [requests, setRequests] = useState(mockResetRequests);
  const [formData, setFormData] = useState({
    positionId: '',
    targetPosition: '',
    reason: '',
    justification: '',
  });

  const selectedPosition = mockPositions.find(p => p.id === formData.positionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.positionId || !formData.targetPosition || !formData.reason || formData.justification.length < 100) {
      toast.error("Please fill in all required fields", {
        description: "Justification must be at least 100 characters"
      });
      return;
    }

    toast.success("Reset request submitted", {
      description: "Request is pending approval from treasury manager"
    });

    setFormData({
      positionId: '',
      targetPosition: '',
      reason: '',
      justification: '',
    });
  };

  const handleApprove = (requestId: string, level: 1 | 2) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const newApproval = {
          level,
          approver: level === 1 ? 'sarah.manager@company.com' : 'cfo@company.com',
          timestamp: new Date().toISOString(),
          comments: `Approved at level ${level}`,
        };
        return {
          ...req,
          approvals: [...req.approvals, newApproval],
          status: level === 2 ? 'Executed' : 'First Approved',
        };
      }
      return req;
    }));

    toast.success(`Level ${level} approval granted`, {
      description: level === 2 ? "Reset has been executed" : "Awaiting CFO approval"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Position Reset Management</h2>
        <p className="text-muted-foreground">Request position corrections with multi-party approval</p>
      </div>

      <Tabs defaultValue="request">
        <TabsList>
          <TabsTrigger value="request">New Reset Request</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals ({requests.filter(r => r.status !== 'Executed').length})</TabsTrigger>
          <TabsTrigger value="history">Reset History</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reset Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={formData.positionId}
                    onValueChange={(value) => setFormData({ ...formData, positionId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position to reset" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPositions.map(pos => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.id} - {pos.currencyPair} ({pos.netPosition.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPosition && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Current Position</div>
                          <div className="font-semibold text-lg">{selectedPosition.netPosition.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Currency Pair</div>
                          <div className="font-semibold text-lg">{selectedPosition.currencyPair}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Liquidity Provider</div>
                          <div className="font-medium">{selectedPosition.liquidityProvider}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Current MTM</div>
                          <div className="font-medium">${selectedPosition.mtmValue.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="target">Target Position *</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="Enter new position amount"
                    value={formData.targetPosition}
                    onChange={(e) => setFormData({ ...formData, targetPosition: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cancelled Deal Correction">Cancelled Deal Correction</SelectItem>
                      <SelectItem value="System Error Correction">System Error Correction</SelectItem>
                      <SelectItem value="Late Trade Entry">Late Trade Entry</SelectItem>
                      <SelectItem value="Reconciliation Adjustment">Reconciliation Adjustment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Detailed Justification * (min 100 characters)</Label>
                  <Textarea
                    id="justification"
                    placeholder="Provide detailed explanation for the reset request..."
                    rows={6}
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  />
                  <div className="text-sm text-muted-foreground">
                    {formData.justification.length} / 100 characters
                  </div>
                </div>

                <Button type="submit" size="lg">
                  Submit Reset Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {requests.filter(r => r.status !== 'Executed').map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{request.id}</CardTitle>
                        <Badge variant={request.status === 'Pending' ? 'secondary' : 'default'}>
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Position ID</div>
                          <div className="font-medium">{request.positionId}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Requested By</div>
                          <div className="font-medium">{request.requestedBy}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Current → Target</div>
                          <div className="font-medium">
                            {request.currentPosition.toLocaleString()} → {request.targetPosition.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Reason</div>
                          <div className="font-medium">{request.reason}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Justification</div>
                        <div className="text-sm bg-muted p-3 rounded">{request.justification}</div>
                      </div>

                      {request.approvals.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Approval History</div>
                          <div className="space-y-2">
                            {request.approvals.map((approval, idx) => (
                              <div key={idx} className="text-sm bg-muted p-3 rounded">
                                <div className="font-medium">Level {approval.level} - {approval.approver}</div>
                                <div className="text-muted-foreground">{new Date(approval.timestamp).toLocaleString()}</div>
                                <div className="mt-1">{approval.comments}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {request.status === 'Pending' && (
                          <Button onClick={() => handleApprove(request.id, 1)}>
                            Approve (1st Level)
                          </Button>
                        )}
                        {request.status === 'First Approved' && (
                          <Button onClick={() => handleApprove(request.id, 2)}>
                            Final Approve (2nd Level)
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Reset History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Position ID</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.positionId}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>{request.currentPosition.toLocaleString()}</TableCell>
                      <TableCell>{request.targetPosition.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={request.status === 'Executed' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
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
