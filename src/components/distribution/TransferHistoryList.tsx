import { useState, useEffect, useRef } from "react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Printer, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

import { TransferHistoryItem } from "@/models/Transfer";
import {
  getTransferHistory,
  getTransferDetails,
  TransferDetails,
} from "@/services/distributionService";
import SuratJalanPrintTemplate from "./SuratJalanPrintTemplate";

const TransferHistoryList = () => {
  const [historyItems, setHistoryItems] = useState<TransferHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for print functionality
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedTransferData, setSelectedTransferData] =
    useState<TransferDetails | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [loadingPrintId, setLoadingPrintId] = useState<number | string | null>(
    null,
  );

  // Reference to the print content
  const printContentRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchTransferHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTransferHistory();
        setHistoryItems(data);
      } catch (err) {
        console.error("Failed to fetch transfer history:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load transfer history",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransferHistory();
  }, []);

  // Helper function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" | null =
      null;

    switch (status) {
      case "completed":
        variant = "default"; // green
        break;
      case "in_transit":
        variant = "secondary"; // gray
        break;
      case "pending":
        variant = "outline"; // outline
        break;
      case "cancelled":
        variant = "destructive"; // red
        break;
      default:
        variant = "outline";
    }

    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  // Render loading skeletons
  const renderLoadingState = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No transfer history found.</p>
    </div>
  );

  // Handle print button click
  const handlePrintClick = async (transferId: number | string) => {
    setIsFetchingDetail(true);
    setSelectedTransferData(null);
    setLoadingPrintId(transferId);

    try {
      const details = await getTransferDetails(transferId);
      setSelectedTransferData(details);
      setIsPrintModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch transfer details:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch transfer details",
      });
    } finally {
      setIsFetchingDetail(false);
      setLoadingPrintId(null);
    }
  };

  // Handle actual printing
  const handlePrint = () => {
    if (!printContentRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Could not open print window. Please check your popup settings.",
      });
      return;
    }

    // Get the HTML content to print
    const contentToPrint = printContentRef.current.innerHTML;

    // Write to the new window with improved styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Surat Jalan ${selectedTransferData?.transferNumber || ""}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            html, body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              display: block;
            }
            body {
              padding: 20px;
              box-sizing: border-box;
            }
            * {
              box-sizing: border-box;
              visibility: visible !important;
              color: black !important;
              background: white !important;
            }
            .print-container {
              width: 100%;
              max-width: 100%;
              display: block;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2 !important;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .mb-6 {
              margin-bottom: 24px;
            }
            .grid {
              display: grid;
            }
            .grid-cols-2 {
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .grid-cols-3 {
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            .border {
              border: 1px solid #000;
              padding: 16px;
              border-radius: 4px;
            }
            .font-bold {
              font-weight: bold;
            }
            .font-semibold {
              font-weight: 600;
            }
            .h-16 {
              height: 64px;
            }
            .mt-8 {
              margin-top: 32px;
            }
            .mb-2 {
              margin-bottom: 8px;
            }
            .mt-12 {
              margin-top: 48px;
            }
            .border-b {
              border-bottom: 1px solid #000;
            }
            .border-dashed {
              border-style: dashed;
            }
            h1, h2, p {
              margin: 0 0 8px 0;
            }
            .bg-white {
              background-color: white !important;
            }
            .bg-gray-100 {
              background-color: #f3f4f6 !important;
            }
            .p-8 {
              padding: 32px;
            }
            .max-w-4xl {
              max-width: 100%;
            }
            .mx-auto {
              margin-left: auto;
              margin-right: auto;
            }
            .text-2xl {
              font-size: 24px;
            }
            .text-lg {
              font-size: 18px;
            }
            .rounded {
              border-radius: 4px;
            }
            .p-4 {
              padding: 16px;
            }
            .p-2 {
              padding: 8px;
            }
            .p-3 {
              padding: 12px;
            }
            .bg-gray-50 {
              background-color: #f9fafb !important;
            }
          </style>
        </head>
        <body>
          ${contentToPrint}
        </body>
      </html>
    `);

    // Trigger print and close the window after printing
    printWindow.document.close();
    printWindow.focus();

    // Add all necessary styles and wait for images to load
    const allImages = Array.from(
      printContentRef.current.querySelectorAll("img"),
    );
    const imagePromises = allImages.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
      });
    });

    // Wait for document to be fully loaded in the new window
    printWindow.onload = () => {
      // Wait for all images to load, then print
      Promise.all(imagePromises).then(() => {
        // Give extra time for fonts and CSS to apply
        setTimeout(() => {
          printWindow.print();
          // Close the window after print dialog is closed
          printWindow.onafterprint = () => printWindow.close();
        }, 1000);
      });
    };
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stock Transfer History</CardTitle>
          <CardDescription>
            View all stock transfers between locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : historyItems.length === 0 ? (
            renderEmptyState()
          ) : (
            <Table>
              <TableCaption>A list of all stock transfers.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.transferDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{item.sourceLocationName}</TableCell>
                    <TableCell>{item.destinationLocationName}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.colorName}</TableCell>
                    <TableCell>
                      {item.transferType === "pasang" && item.sizeName
                        ? item.sizeName
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {item.transferType === "dus" ? "Box" : "Pair"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell>{renderStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.notes ? (
                        <span className="max-w-[200px] truncate block">
                          {item.notes}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePrintClick(item.id)}
                        disabled={
                          isFetchingDetail || loadingPrintId === item.id
                        }
                        className="h-8 w-8"
                        title="Print Delivery Letter"
                      >
                        {loadingPrintId === item.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Printer className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Print Preview Dialog */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Delivery Letter - {selectedTransferData?.transferNumber || ""}
            </DialogTitle>
          </DialogHeader>

          {/* Print Preview Content */}
          <div className="print-container" ref={printContentRef}>
            {selectedTransferData && (
              <SuratJalanPrintTemplate transferData={selectedTransferData} />
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="default"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransferHistoryList;
