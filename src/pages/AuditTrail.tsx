import { useState, useMemo } from "react";
import { mockAuditEvents } from "@/data/mockData";
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
import { FileDown, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AuditTrail() {
  const [events] = useState(mockAuditEvents);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState('');

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (eventTypeFilter !== 'all' && event.eventType !== eventTypeFilter) return false;
      if (statusFilter !== 'all' && event.status !== statusFilter) return false;
      if (userFilter && !event.user.toLowerCase().includes(userFilter.toLowerCase())) return false;
      return true;
    });
  }, [events, eventTypeFilter, statusFilter, userFilter]);

  const handleExport = () => {
    toast.success("Audit trail exported", {
      description: "CSV file has been downloaded"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-muted-foreground">Immutable log of all treasury operations</p>
        </div>
        <Button onClick={handleExport}>
          <FileDown className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="Position Reset">Position Reset</SelectItem>
                <SelectItem value="Hedge Entry">Hedge Entry</SelectItem>
                <SelectItem value="Approval">Approval</SelectItem>
                <SelectItem value="Rate Update">Rate Update</SelectItem>
                <SelectItem value="Configuration Change">Configuration Change</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by user..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />

            <Button variant="outline" onClick={() => {
              setEventTypeFilter('all');
              setStatusFilter('all');
              setUserFilter('');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No events found matching the filters
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        event.status === 'Completed' ? 'default' :
                        event.status === 'Approved' ? 'default' :
                        event.status === 'Pending' ? 'secondary' : 'outline'
                      }>
                        {event.eventType}
                      </Badge>
                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                    
                    <div className="text-lg font-semibold">{event.description}</div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <div>User: {event.user}</div>
                      <div>Event ID: {event.id}</div>
                    </div>

                    {Object.keys(event.details).length > 0 && (
                      <div className="mt-4 bg-muted p-3 rounded text-sm">
                        <div className="font-medium mb-2">Event Details:</div>
                        {event.eventType === 'Configuration Change' && event.details.added && event.details.removed ? (
                          <div className="space-y-3">
                            {event.details.added.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Added Currencies:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(event.details.added as string[]).map((currency) => (
                                    <Badge key={currency} className="bg-direct text-direct-foreground">
                                      +{currency}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {event.details.removed.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Removed Currencies:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(event.details.removed as string[]).map((currency) => (
                                    <Badge key={currency} variant="destructive">
                                      -{currency}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Impact:</span>
                              <span className="font-medium ml-2">{event.details.impactScope}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            {Object.entries(event.details).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-muted-foreground">{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
