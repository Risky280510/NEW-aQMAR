import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";
import { warehouseService } from "@/services/warehouseService";
import { GoodsReceipt } from "@/models/GoodsReceipt";
import { getProductById } from "@/services/productService";
import { getColorById } from "@/services/colorService";
import { getLocationById } from "@/services/locationService";

const GoodsReceiptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<GoodsReceipt | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [colorName, setColorName] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceiptDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch the receipt
        const receiptData = await warehouseService.getGoodsReceiptById(
          Number(id),
        );

        if (!receiptData) {
          setError("Receipt not found");
          setIsLoading(false);
          return;
        }

        setReceipt(receiptData);

        // Fetch related data
        const [product, color, location] = await Promise.all([
          getProductById(receiptData.product_id),
          getColorById(receiptData.color_id),
          getLocationById(receiptData.location_id),
        ]);

        setProductName(product?.product_name || "Unknown Product");
        setColorName(color?.color_name || "Unknown Color");
        setLocationName(location?.location_name || "Unknown Location");
      } catch (err) {
        console.error("Error fetching receipt details:", err);
        setError("Failed to load receipt details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceiptDetails();
  }, [id]);

  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      return format(date, "dd MMM yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/warehouse/receipts");
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Receipts
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white print:shadow-none">
      <CardHeader className="print:pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Goods Receipt Details</CardTitle>
            <CardDescription>
              Receipt #{receipt?.id} -{" "}
              {receipt?.receipt_date && formatDate(receipt.receipt_date)}
            </CardDescription>
          </div>
          <div className="flex space-x-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Receipt Information
              </h3>
              <div className="mt-2 border rounded-md p-4 space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-sm font-medium">Receipt Date:</span>
                  <span className="text-sm col-span-2">
                    {receipt?.receipt_date && formatDate(receipt.receipt_date)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-sm font-medium">Reference No:</span>
                  <span className="text-sm col-span-2">
                    {receipt?.reference_number || "-"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-sm font-medium">Supplier:</span>
                  <span className="text-sm col-span-2">
                    {receipt?.supplier || "-"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-sm font-medium">Location:</span>
                  <span className="text-sm col-span-2">{locationName}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Product Information
              </h3>
              <div className="mt-2 border rounded-md p-4 space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-sm font-medium">Product:</span>
                  <span className="text-sm col-span-2">{productName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-sm font-medium">Color:</span>
                  <span className="text-sm col-span-2">{colorName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-sm font-medium">Quantity:</span>
                  <span className="text-sm col-span-2">
                    {receipt?.bun_count} boxes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Additional Information
          </h3>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm">
              This receipt was created on{" "}
              {receipt?.created_at ? formatDate(receipt.created_at) : "N/A"}.
              The goods have been added to the inventory at {locationName}.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between print:hidden">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Receipts
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoodsReceiptDetail;
