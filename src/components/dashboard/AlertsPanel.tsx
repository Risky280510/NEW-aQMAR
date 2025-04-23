import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Package,
  TruckIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  category: "inventory" | "transfer" | "system";
  title: string;
  message: string;
  timestamp: string;
  location: string;
  status: "new" | "in-progress" | "resolved";
  actionRequired?: boolean;
}

const AlertsPanel = ({ alerts = defaultAlerts }: { alerts?: Alert[] }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab !== "all" && alert.category !== activeTab) return false;
    if (locationFilter !== "all" && alert.location !== locationFilter)
      return false;
    if (statusFilter !== "all" && alert.status !== statusFilter) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  const infoCount = alerts.filter((a) => a.type === "info").length;

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">Alerts & Notifications</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="rounded-full">
              {criticalCount}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-full"
            >
              {warningCount}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full"
            >
              {infoCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="transfer">Transfers</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="warehouse-main">Main Warehouse</SelectItem>
                  <SelectItem value="store-a">Store A</SelectItem>
                  <SelectItem value="store-b">Store B</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            <AlertsList alerts={filteredAlerts} />
          </TabsContent>
          <TabsContent value="inventory" className="m-0">
            <AlertsList alerts={filteredAlerts} />
          </TabsContent>
          <TabsContent value="transfer" className="m-0">
            <AlertsList alerts={filteredAlerts} />
          </TabsContent>
          <TabsContent value="system" className="m-0">
            <AlertsList alerts={filteredAlerts} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const AlertsList = ({ alerts }: { alerts: Alert[] }) => {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">
          No alerts match your current filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

const AlertItem = ({ alert }: { alert: Alert }) => {
  const getAlertIcon = () => {
    switch (alert.category) {
      case "inventory":
        return <Package className={`h-5 w-5 ${getIconColor()}`} />;
      case "transfer":
        return <TruckIcon className={`h-5 w-5 ${getIconColor()}`} />;
      default:
        return <AlertTriangle className={`h-5 w-5 ${getIconColor()}`} />;
    }
  };

  const getIconColor = () => {
    switch (alert.type) {
      case "critical":
        return "text-destructive";
      case "warning":
        return "text-amber-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = () => {
    switch (alert.status) {
      case "new":
        return (
          <Badge variant="destructive" className="text-xs">
            New
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 text-xs"
          >
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 text-xs"
          >
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border ${alert.type === "critical" ? "border-red-200 bg-red-50" : alert.type === "warning" ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">{getAlertIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{alert.title}</h4>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{alert.timestamp}</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{alert.location}</span>
            </div>
            {alert.actionRequired && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Dismiss
                </Button>
                <Button size="sm" className="h-7 text-xs">
                  Take Action
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sample data for demonstration
const defaultAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    category: "inventory",
    title: "Critical Stock Level",
    message:
      "Product SKU-12345 (Running Shoes - Black) is below minimum threshold (5 units remaining)",
    timestamp: "10 minutes ago",
    location: "store-a",
    status: "new",
    actionRequired: true,
  },
  {
    id: "2",
    type: "warning",
    category: "transfer",
    title: "Pending Transfer Approval",
    message:
      "Transfer #TR-7890 from Main Warehouse to Store B requires approval",
    timestamp: "1 hour ago",
    location: "warehouse-main",
    status: "in-progress",
    actionRequired: true,
  },
  {
    id: "3",
    type: "info",
    category: "system",
    title: "System Maintenance",
    message:
      "Scheduled maintenance will occur tonight at 2:00 AM. System may be unavailable for up to 30 minutes.",
    timestamp: "3 hours ago",
    location: "all",
    status: "new",
    actionRequired: false,
  },
  {
    id: "4",
    type: "critical",
    category: "inventory",
    title: "Stock Discrepancy Detected",
    message:
      "Physical count for SKU-67890 (Athletic Socks - White) shows 15 units missing",
    timestamp: "2 hours ago",
    location: "store-b",
    status: "new",
    actionRequired: true,
  },
  {
    id: "5",
    type: "warning",
    category: "transfer",
    title: "Transfer Delayed",
    message:
      "Transfer #TR-4567 to Store A is delayed due to transportation issues",
    timestamp: "5 hours ago",
    location: "warehouse-main",
    status: "in-progress",
    actionRequired: false,
  },
  {
    id: "6",
    type: "info",
    category: "system",
    title: "New Feature Available",
    message:
      "Barcode scanning feature has been added to the mobile app. Update now to access.",
    timestamp: "1 day ago",
    location: "all",
    status: "resolved",
    actionRequired: false,
  },
];

export default AlertsPanel;
