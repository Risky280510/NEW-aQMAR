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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import {
  OpnameAdjustmentItem,
  getOpnameAdjustments,
} from "@/services/reportService";
import { getLocations } from "@/services/locationService";
import { Location } from "@/models/Location";

const StockOpnameReport: React.FC = () => {
  // State for date range picker
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    to: new Date(),
  });

  // State for location filter
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [locations, setLocations] = useState<Location[]>([]);

  // State for adjustments data
  const [adjustments, setAdjustments] = useState<OpnameAdjustmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations for the filter dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getLocations();
        setLocations(locationsData);
      } catch (err) {
        console.error("Error fetching locations:", err);
        // Don't set error state here as it's not critical for the main functionality
      }
    };

    fetchLocations();
  }, []);

  // Fetch adjustments data when filters change
  useEffect(() => {
    const fetchAdjustments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const filters: {
          dateRange?: [Date, Date];
          locationId?: number;
        } = {};

        // Add date range filter if both from and to dates are selected
        if (date?.from && date?.to) {
          filters.dateRange = [date.from, date.to];
        }

        // Add location filter if a location is selected
        if (locationId) {
          filters.locationId = locationId;
        }

        const data = await getOpnameAdjustments(filters);
        setAdjustments(data);
      } catch (err) {
        console.error("Error fetching adjustments:", err);
        setError("Failed to load adjustment data. Please try again later.");
        setAdjustments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdjustments();
  }, [date, locationId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Stock Opname Adjustment Report
          </h1>
          <p className="text-muted-foreground">
            View history of stock adjustments from inventory counts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter adjustments by date range and location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Range Picker */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">
                Date Range
              </label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
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
                  <PopoverContent className="w-auto p-0" align="start">
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
            </div>

            {/* Location Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Select
                value={locationId?.toString() || "all"}
                onValueChange={(value) =>
                  setLocationId(
                    value && value !== "all" ? parseInt(value) : undefined,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) =>
                    location.id ? (
                      <SelectItem
                        key={location.id}
                        value={location.id.toString()}
                      >
                        {location.location_name}
                      </SelectItem>
                    ) : null,
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
          <CardDescription>
            List of stock adjustments from opname counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && adjustments.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No adjustment records found for the selected filters.
              </p>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && adjustments.length > 0 && (
            <Table>
              <TableCaption>Stock opname adjustments history</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Stock Type</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>System Stock</TableHead>
                  <TableHead>Physical Count</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id.toString()}>
                    <TableCell>
                      {format(
                        new Date(adjustment.tanggalPenyesuaian),
                        "dd MMM yyyy",
                      )}
                    </TableCell>
                    <TableCell>{adjustment.locationName}</TableCell>
                    <TableCell>
                      <div>
                        <div>{adjustment.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {adjustment.colorName}
                          {adjustment.sizeName && ` - ${adjustment.sizeName}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {adjustment.tipeStok === "dus" ? "Box" : "Pair"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          adjustment.penyesuaianJumlah > 0
                            ? "success"
                            : "destructive"
                        }
                        className="font-mono"
                      >
                        {adjustment.penyesuaianJumlah > 0 ? "+" : ""}
                        {adjustment.penyesuaianJumlah}
                      </Badge>
                    </TableCell>
                    <TableCell>{adjustment.stokSystemBefore}</TableCell>
                    <TableCell>{adjustment.stokFisik}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {adjustment.reason || "-"}
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

export default StockOpnameReport;
