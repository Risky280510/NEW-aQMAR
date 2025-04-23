import { useState, useEffect } from "react";
import { format } from "date-fns";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Services
import { getRejectListItems } from "@/services/rejectService";

// Types
import { RejectListItem } from "@/models/Reject";

const RejectList = () => {
  // State
  const [rejects, setRejects] = useState<RejectListItem[]>([]);
  const [filteredRejects, setFilteredRejects] = useState<RejectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Load data
  useEffect(() => {
    const loadRejects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getRejectListItems();
        setRejects(data);
        setFilteredRejects(data);
      } catch (err) {
        console.error("Error loading rejected items:", err);
        setError("Failed to load rejected items. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRejects();
  }, []);

  // Apply filters when search term, status filter, or location filter changes
  useEffect(() => {
    if (!rejects.length) return;

    let results = [...rejects];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchLower) ||
          item.reason.toLowerCase().includes(searchLower) ||
          item.colorName.toLowerCase().includes(searchLower),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(
        (item) => item.statusRijek.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Apply location filter
    if (locationFilter !== "all") {
      results = results.filter(
        (item) =>
          item.locationName.toLowerCase() === locationFilter.toLowerCase(),
      );
    }

    setFilteredRejects(results);
  }, [searchTerm, statusFilter, locationFilter, rejects]);

  // Get unique locations for filter
  const uniqueLocations = [
    ...new Set(rejects.map((item) => item.locationName)),
  ];

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(rejects.map((item) => item.statusRijek))];

  // Helper function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "destructive" | "outline" | "secondary" =
      "default";

    switch (status.toLowerCase()) {
      case "new":
        variant = "default"; // Blue
        break;
      case "destroyed":
        variant = "destructive"; // Red
        break;
      case "repaired":
        variant = "secondary"; // Gray
        break;
      default:
        variant = "outline";
    }

    return <Badge variant={variant}>{status}</Badge>;
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle>List of Rejected Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle>List of Rejected Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>List of Rejected Items</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/rejected/input")}
        >
          Record New Reject
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, colors, or reasons..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="w-full sm:w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-[180px]">
                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location.toLowerCase()}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {searchTerm || statusFilter !== "all" || locationFilter !== "all" ? (
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Showing {filteredRejects.length} of {rejects.length} items
              </span>
              {(searchTerm ||
                statusFilter !== "all" ||
                locationFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setLocationFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {filteredRejects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {rejects.length > 0
                ? "No items match your filters. Try adjusting your search criteria."
                : "No rejected items found. Click 'Record New Reject' to add one."}
            </p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of all rejected items.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRejects.map((reject) => (
                <TableRow key={reject.id}>
                  <TableCell>
                    {reject.rejectDate instanceof Date
                      ? format(reject.rejectDate, "dd MMM yyyy")
                      : format(new Date(reject.rejectDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{reject.locationName}</TableCell>
                  <TableCell>{reject.productName}</TableCell>
                  <TableCell>{reject.colorName}</TableCell>
                  <TableCell>{reject.sizeName}</TableCell>
                  <TableCell>{reject.quantity}</TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={reject.reason}
                  >
                    {reject.reason}
                  </TableCell>
                  <TableCell>{renderStatusBadge(reject.statusRijek)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Details
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

export default RejectList;
