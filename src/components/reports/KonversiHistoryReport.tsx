import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConversionHistoryItem, reportService } from "@/services/reportService";

const KonversiHistoryReport: React.FC = () => {
  // State for date range picker
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date(),
  });

  // State for conversion history data
  const [conversionHistory, setConversionHistory] = useState<
    ConversionHistoryItem[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Main Warehouse ID (assuming it's 1)
  const MAIN_WAREHOUSE_ID = 1;

  // Fetch conversion history data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Only fetch if we have a complete date range
        if (date?.from && date?.to) {
          const data = await reportService.getConversionHistory({
            dateRange: [date.from, date.to],
            locationId: MAIN_WAREHOUSE_ID,
          });
          setConversionHistory(data);
        }
      } catch (err) {
        console.error("Error fetching conversion history:", err);
        setError("Failed to load conversion history data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date]);

  // Format date for display
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "PPP");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conversion History Report</h1>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Box to Unit Conversion History</CardTitle>
          <CardDescription>
            History of box to unit conversions in the warehouse
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && conversionHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No conversion history found for the selected date range.
              </p>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && conversionHistory.length > 0 && (
            <Table>
              <TableCaption>
                Showing {conversionHistory.length} conversion records
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Boxes</TableHead>
                  <TableHead className="text-right">Expected Pairs</TableHead>
                  <TableHead className="text-right">Actual Pairs</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversionHistory.map((item) => (
                  <TableRow key={item.id.toString()}>
                    <TableCell>{formatDate(item.conversionDate)}</TableCell>
                    <TableCell>{item.referenceNumber}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.colorName}</TableCell>
                    <TableCell className="text-right">
                      {item.amountDus}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.expectedPairs}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.actualPairs || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          item.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800",
                        )}
                      >
                        {item.status}
                      </span>
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

export default KonversiHistoryReport;
