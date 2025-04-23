import React, { useEffect, useState } from "react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import {
  warehouseService,
  WarehousePasangStockItem,
} from "@/services/warehouseService";

// Main Warehouse ID (in a real app, this might come from a config or context)
const MAIN_WAREHOUSE_ID = 1;

const WarehousePasangStockList: React.FC = () => {
  const [stockItems, setStockItems] = useState<WarehousePasangStockItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data =
          await warehouseService.getWarehousePasangStock(MAIN_WAREHOUSE_ID);
        setStockItems(data);
      } catch (err) {
        console.error("Error fetching pasang stock:", err);
        setError("Failed to load stock data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const handleExportExcel = () => {
    if (stockItems.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for Excel with explicit headers and mapping
    const dataForExcel = stockItems.map((item) => ({
      Location: "Main Warehouse",
      "Product SKU": item.productSku,
      "Variant SKU": item.variantSku || "-",
      "Product Name": item.productName,
      Color: item.colorName,
      Size: item.sizeName,
      "Stock (Pairs)": item.stokPasang,
    }));

    // Create worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Pasang Gudang");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "laporan_stok_pasang_gudang_utama.xlsx");
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Stok Pasang - Gudang Utama</CardTitle>
          <CardDescription>
            View and manage pair/unit stock in the main warehouse
          </CardDescription>
        </div>
        <Button
          onClick={handleExportExcel}
          disabled={isLoading || stockItems.length === 0}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export to Excel
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
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : stockItems.length === 0 ? (
          <Alert>
            <AlertTitle>No Stock Found</AlertTitle>
            <AlertDescription>
              There is no pair/unit stock in the Main Warehouse yet.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableCaption>
              List of pair/unit stock in Main Warehouse
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Product SKU</TableHead>
                <TableHead>Variant SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Stock (Pairs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productSku}</TableCell>
                  <TableCell>{item.variantSku || "-"}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.colorName}</TableCell>
                  <TableCell>{item.sizeName}</TableCell>
                  <TableCell className="text-right">
                    {item.stokPasang}
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

export default WarehousePasangStockList;
