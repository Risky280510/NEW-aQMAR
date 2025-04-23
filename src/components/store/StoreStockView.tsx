import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  warehouseService,
  WarehouseDusStockItem,
  WarehousePasangStockItem,
} from "@/services/warehouseService";

const StoreStockView = () => {
  // In a real app, this would come from context or props
  const MOCK_STORE_ID = 2;
  const currentStoreLocationId = MOCK_STORE_ID;

  const [dusStockItems, setDusStockItems] = useState<WarehouseDusStockItem[]>(
    [],
  );
  const [pasangStockItems, setPasangStockItems] = useState<
    WarehousePasangStockItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreStock = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [dusStock, pasangStock] = await Promise.all([
          warehouseService.getWarehouseDusStock(currentStoreLocationId),
          warehouseService.getWarehousePasangStock(currentStoreLocationId),
        ]);

        setDusStockItems(dusStock);
        setPasangStockItems(pasangStock);
      } catch (err) {
        console.error("Error fetching store stock:", err);
        setError("Failed to load store stock data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreStock();
  }, [currentStoreLocationId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Current Store Stock</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="dus" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dus">Dus Stock</TabsTrigger>
              <TabsTrigger value="pasang">Installation Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="dus" className="mt-4">
              {dusStockItems.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No dus stock available at this location.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Dus Stock</TableHead>
                      <TableHead className="text-right">
                        Items per Box
                      </TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dusStockItems.map((item, index) => (
                      <TableRow
                        key={`${item.productId}-${item.colorId}-${index}`}
                      >
                        <TableCell>{item.productSku}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.colorName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.stockDus}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.isiDus || "N/A"}
                        </TableCell>
                        <TableCell>{item.category || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="pasang" className="mt-4">
              {pasangStockItems.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No installation stock available at this location.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Pairs Stock</TableHead>
                      <TableHead>Variant SKU</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pasangStockItems.map((item, index) => (
                      <TableRow
                        key={`${item.productId}-${item.colorId}-${item.sizeId}-${index}`}
                      >
                        <TableCell>{item.productSku}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.colorName}</TableCell>
                        <TableCell>{item.sizeName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.stokPasang}
                        </TableCell>
                        <TableCell>{item.variantSku || "N/A"}</TableCell>
                        <TableCell>{item.category || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreStockView;
