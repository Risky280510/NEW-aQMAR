import React, { useEffect, useState } from "react";
import { salesService, SalesHistoryItem } from "@/services/salesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { Eye } from "lucide-react";

// Mock current store location ID (in a real app, this would come from context or state)
const currentStoreLocationId = 1;

const SalesHistoryList: React.FC = () => {
  const [salesHistory, setSalesHistory] = useState<SalesHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getSalesHistory(currentStoreLocationId);
        setSalesHistory(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching sales history:", err);
        setError("Failed to load sales history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesHistory();
  }, []);

  const formatDate = (dateString: string | Date) => {
    if (typeof dateString === "string") {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    }
    return format(dateString, "MMM dd, yyyy h:mm a");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 bg-background">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Sales History - Store Location {currentStoreLocationId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            // Loading skeleton
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : salesHistory.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No sales records found for this location.
              </p>
            </div>
          ) : (
            // Sales history table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale Date</TableHead>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesHistory.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell>{sale.orderNumber}</TableCell>
                    <TableCell>{sale.itemCount || "N/A"}</TableCell>
                    <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell>
                      {sale.customerName || "Walk-in Customer"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          console.log(`View details for order ${sale.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesHistoryList;
