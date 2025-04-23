import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  warehouseService,
  WarehouseDusStockItem,
} from "@/services/warehouseService";

// Main warehouse location ID (in a real app, this might come from config or context)
const MAIN_WAREHOUSE_ID = 1;

const WarehouseDusStockList: React.FC = () => {
  const [stockItems, setStockItems] = useState<WarehouseDusStockItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const fetchStockData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data =
        await warehouseService.getWarehouseDusStock(MAIN_WAREHOUSE_ID);
      setStockItems(data);
    } catch (err) {
      console.error("Error fetching warehouse dus stock:", err);
      setError("Failed to load warehouse stock data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData, refreshKey]);

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">
          Dus Stock - Main Warehouse
        </CardTitle>
        <Button variant="outline" onClick={refreshData} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Box Content</TableHead>
                <TableHead className="text-right">Box Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No stock items found
                  </TableCell>
                </TableRow>
              ) : (
                stockItems.map((item, index) => (
                  <TableRow key={`${item.productId}-${item.colorId}-${index}`}>
                    <TableCell>{item.productSku}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.colorName}</TableCell>
                    <TableCell>{item.category || "N/A"}</TableCell>
                    <TableCell>{item.isiDus || "N/A"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {item.stockDus}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default WarehouseDusStockList;
