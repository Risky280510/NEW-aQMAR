import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertCircle, Eye, RefreshCw } from "lucide-react";
import {
  warehouseService,
  GoodsReceiptHistoryItem,
} from "@/services/warehouseService";

const GoodsReceiptHistoryList: React.FC = () => {
  const [receipts, setReceipts] = useState<GoodsReceiptHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const fetchGoodsReceiptHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await warehouseService.getGoodsReceiptHistory();
      setReceipts(data);
    } catch (err) {
      console.error("Error fetching goods receipt history:", err);
      setError("Failed to load goods receipt history. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoodsReceiptHistory();
  }, [fetchGoodsReceiptHistory, refreshKey]);

  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      return format(date, "dd MMM yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Goods Receipt History</CardTitle>
          <CardDescription>
            View all incoming goods receipts recorded in the system
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/warehouse/receipts/add">
              <Plus className="mr-2 h-4 w-4" /> Add New Receipt
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : receipts.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No goods receipts found. Click "Add New Receipt" to record a new
              goods receipt.
            </p>
            <Button asChild>
              <Link to="/warehouse/receipts/add">
                <Plus className="mr-2 h-4 w-4" /> Add New Receipt
              </Link>
            </Button>
          </div>
        ) : (
          // Data table
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt Date</TableHead>
                <TableHead>Reference No.</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Quantity (Boxes)</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>{formatDate(receipt.receipt_date)}</TableCell>
                  <TableCell>{receipt.reference_number || "-"}</TableCell>
                  <TableCell>{receipt.supplier || "-"}</TableCell>
                  <TableCell>{receipt.productName || "-"}</TableCell>
                  <TableCell>{receipt.colorName || "-"}</TableCell>
                  <TableCell>{receipt.bun_count}</TableCell>
                  <TableCell>
                    {receipt.locationName || "Main Warehouse"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      {receipt.status || "Completed"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/warehouse/receipts/${receipt.id}`}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default GoodsReceiptHistoryList;
