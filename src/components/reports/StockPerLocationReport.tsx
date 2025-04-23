import React, { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Location } from "@/models/Location";
import { getLocations } from "@/services/locationService";
import {
  reportService,
  DusStockItemWithLocation,
  PasangStockItemWithLocation,
} from "@/services/reportService";

const StockPerLocationReport: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [dusStockItems, setDusStockItems] = useState<
    DusStockItemWithLocation[]
  >([]);
  const [pasangStockItems, setPasangStockItems] = useState<
    PasangStockItemWithLocation[]
  >([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState<boolean>(true);
  const [isLoadingDusStock, setIsLoadingDusStock] = useState<boolean>(true);
  const [isLoadingPasangStock, setIsLoadingPasangStock] =
    useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError("Failed to load locations. Please try again later.");
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // Fetch dus stock data
  useEffect(() => {
    const fetchDusStock = async () => {
      try {
        setIsLoadingDusStock(true);
        setError(null);

        const filters =
          selectedLocationId !== "all"
            ? { locationId: parseInt(selectedLocationId) }
            : undefined;

        const data = await reportService.getAllDusStock(filters);
        setDusStockItems(data);
      } catch (err) {
        console.error("Error fetching dus stock:", err);
        setError("Failed to load dus stock data. Please try again later.");
      } finally {
        setIsLoadingDusStock(false);
      }
    };

    fetchDusStock();
  }, [selectedLocationId]);

  // Fetch pasang stock data
  useEffect(() => {
    const fetchPasangStock = async () => {
      try {
        setIsLoadingPasangStock(true);
        setError(null);

        const filters =
          selectedLocationId !== "all"
            ? { locationId: parseInt(selectedLocationId) }
            : undefined;

        const data = await reportService.getAllPasangStock(filters);
        setPasangStockItems(data);
      } catch (err) {
        console.error("Error fetching pasang stock:", err);
        setError("Failed to load pasang stock data. Please try again later.");
      } finally {
        setIsLoadingPasangStock(false);
      }
    };

    fetchPasangStock();
  }, [selectedLocationId]);

  const handleLocationChange = (value: string) => {
    setSelectedLocationId(value);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">
          Stock Per Location Report
        </CardTitle>
        <div className="w-[200px]">
          {isLoadingLocations ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={selectedLocationId}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem
                    key={location.id}
                    value={location.id?.toString() || ""}
                  >
                    {location.location_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="dus" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="dus">Dus Stock</TabsTrigger>
              <TabsTrigger value="pasang">Pasang Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="dus">
              {isLoadingDusStock ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : dusStockItems.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No dus stock items found for the selected location.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Product SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Box Content</TableHead>
                      <TableHead className="text-right">Box Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dusStockItems.map((item, index) => (
                      <TableRow
                        key={`${item.productId}-${item.colorId}-${index}`}
                      >
                        <TableCell>{item.locationName}</TableCell>
                        <TableCell>{item.productSku}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.colorName}</TableCell>
                        <TableCell>{item.category || "N/A"}</TableCell>
                        <TableCell>{item.isiDus || "N/A"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.stockDus}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="pasang">
              {isLoadingPasangStock ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : pasangStockItems.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No pasang stock items found for the selected location.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Product SKU</TableHead>
                      <TableHead>Variant SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">
                        Stock (Pairs)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pasangStockItems.map((item, index) => (
                      <TableRow
                        key={`${item.productId}-${item.colorId}-${item.sizeId}-${index}`}
                      >
                        <TableCell>{item.locationName}</TableCell>
                        <TableCell>{item.productSku}</TableCell>
                        <TableCell>{item.variantSku || "-"}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.colorName}</TableCell>
                        <TableCell>{item.sizeName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.stokPasang}
                        </TableCell>
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

export default StockPerLocationReport;
