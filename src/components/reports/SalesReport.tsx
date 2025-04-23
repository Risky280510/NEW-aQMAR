import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getLocations } from "@/services/locationService";
import { salesService, SalesHistoryItem } from "@/services/salesService";
import { Location } from "@/models/Location";

// Define the form schema with Zod
const formSchema = z.object({
  locationId: z.string(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SalesReport: React.FC = () => {
  // State for locations data
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLocationsLoading, setIsLocationsLoading] = useState(true);

  // State for sales report data
  const [salesData, setSalesData] = useState<SalesHistoryItem[] | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: "all",
      dateRange: {
        from: subDays(new Date(), 30), // Last 30 days
        to: new Date(),
      },
    },
  });

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getLocations();
        setLocations(locationsData);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setIsLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsReportLoading(true);
    setSalesData(null);
    setReportError(null);

    try {
      const locationId =
        values.locationId === "all" ? undefined : Number(values.locationId);
      const dateRange = [values.dateRange.from, values.dateRange.to] as [
        Date,
        Date,
      ];

      const data = await salesService.getSalesHistory(locationId, {
        dateRange,
      });
      setSalesData(data);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      setReportError("Failed to fetch sales data. Please try again.");
    } finally {
      setIsReportLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total sales
  const calculateTotalSales = () => {
    if (!salesData) return 0;
    return salesData.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
          <CardDescription>
            View sales transactions by location and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location Filter */}
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        disabled={isLocationsLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {locations.map((location) => (
                            <SelectItem
                              key={location.id}
                              value={location.id.toString()}
                            >
                              {location.location_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Range Filter */}
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Range</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "PPP")} -{" "}
                                    {format(field.value.to, "PPP")}
                                  </>
                                ) : (
                                  format(field.value.from, "PPP")
                                )
                              ) : (
                                <span>Select a date range</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value.from}
                            selected={{
                              from: field.value.from,
                              to: field.value.to,
                            }}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isReportLoading}>
                {isReportLoading ? "Loading..." : "Show Report"}
              </Button>
            </form>
          </Form>

          {/* Results Display Area */}
          {isReportLoading && (
            <div className="mt-6 flex justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Loading sales data...
                </p>
              </div>
            </div>
          )}

          {reportError && (
            <div className="mt-6">
              <div className="rounded-md bg-destructive/15 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-destructive"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-destructive/80">
                      <p>{reportError}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isReportLoading &&
            !reportError &&
            salesData &&
            salesData.length === 0 && (
              <div className="mt-6 text-center">
                <div className="rounded-md bg-muted p-6">
                  <h3 className="text-sm font-medium">No sales data found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your filters or selecting a different date
                    range.
                  </p>
                </div>
              </div>
            )}

          {!isReportLoading &&
            !reportError &&
            salesData &&
            salesData.length > 0 && (
              <div className="mt-6">
                <Table>
                  <TableCaption>
                    Sales transactions for the selected period
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.orderNumber}
                        </TableCell>
                        <TableCell>
                          {format(new Date(sale.saleDate), "PPP")}
                        </TableCell>
                        <TableCell>{sale.itemCount || "—"}</TableCell>
                        <TableCell>{sale.customerName || "—"}</TableCell>
                        <TableCell>{sale.paymentMethod || "—"}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 border-t pt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Showing {salesData.length} transaction
                    {salesData.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex space-x-6 text-sm font-medium">
                    <div className="bg-muted px-4 py-2 rounded-md">
                      Total Transactions:{" "}
                      <span className="font-bold">{salesData.length}</span>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-md">
                      Total Sales:{" "}
                      <span className="font-bold">
                        {formatCurrency(calculateTotalSales())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReport;
