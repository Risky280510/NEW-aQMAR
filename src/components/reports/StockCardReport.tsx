import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { cn } from "@/lib/utils";
import { getLocations } from "@/services/locationService";
import { getProducts, getSizesForProduct } from "@/services/productService";
import {
  reportService,
  StockCardData,
  StockCardMovement,
} from "@/services/reportService";
import { Location } from "@/models/Location";
import { Product } from "@/models/Product";
import { Size } from "@/services/productService";

const formSchema = z.object({
  locationId: z.string().min(1, { message: "Location is required" }),
  type: z.enum(["dus", "pasang"]),
  productId: z.string().min(1, { message: "Product is required" }),
  colorId: z.string().min(1, { message: "Color is required" }),
  sizeId: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function StockCardReport() {
  const [stockCardData, setStockCardData] = useState<StockCardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: "",
      type: "dus",
      productId: "",
      colorId: "",
      sizeId: "",
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
      },
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch real locations data
        const locationsData = await getLocations();
        setLocations(locationsData);

        // Fetch real products data
        const productsData = await getProducts();
        setProducts(productsData);

        // Mock colors data
        setColors([
          { id: 1, color_name: "Black", color_code: "#000000" },
          { id: 2, color_name: "White", color_code: "#FFFFFF" },
          { id: 3, color_name: "Red", color_code: "#FF0000" },
          { id: 4, color_name: "Blue", color_code: "#0000FF" },
          { id: 5, color_name: "Green", color_code: "#00FF00" },
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Failed to load initial data. Please refresh the page.");
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchSizes = async () => {
      const productId = form.getValues().productId;

      if (!productId) {
        setSizes([]);
        return;
      }

      try {
        // Fetch real sizes data for the selected product
        const sizesData = await getSizesForProduct(parseInt(productId));
        setSizes(sizesData);
      } catch (error) {
        console.error("Error fetching sizes:", error);
        setError("Failed to load sizes for the selected product.");
        setSizes([]);
      }
    };

    fetchSizes();
  }, [form.watch("productId")]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    setStockCardData(null);

    try {
      if (
        !values.locationId ||
        !values.productId ||
        !values.colorId ||
        (values.type === "pasang" && !values.sizeId)
      ) {
        setError("Please fill all required fields");
        setIsLoading(false);
        return;
      }

      const params = {
        locationId: parseInt(values.locationId),
        type: values.type,
        productId: parseInt(values.productId),
        colorId: parseInt(values.colorId),
        sizeId: values.sizeId ? parseInt(values.sizeId) : undefined,
        dateRange: [values.dateRange.from, values.dateRange.to] as [Date, Date],
      };

      await new Promise((resolve) => setTimeout(resolve, 800));

      const data = await reportService.getStockCard(params);
      setStockCardData(data);
    } catch (err) {
      setError("Failed to fetch stock card data. Please try again.");
      console.error("Error fetching stock card data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Stock Card Report</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>
            Select parameters to view stock movement history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stock type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dus">Dus (Box)</SelectItem>
                          <SelectItem value="pasang">Pasang (Pair)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id?.toString() || ""}
                          >
                            {product.product_name} ({product.product_sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem
                            key={color.id}
                            value={color.id?.toString() || ""}
                          >
                            {color.color_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("type") === "pasang" && (
                <FormField
                  control={form.control}
                  name="sizeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem
                              key={size.id}
                              value={size.id?.toString() || ""}
                            >
                              {size.size_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Size selection is required for pair-based inventory
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "LLL dd, y")} -{" "}
                                  {format(field.value.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(field.value.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={{
                            from: field.value?.from,
                            to: field.value?.to,
                          }}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select the date range for the stock movement history
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Generate Report"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : stockCardData ? (
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement History</CardTitle>
            <CardDescription>
              Starting Balance: {stockCardData.startingBalance}{" "}
              {form.getValues().type === "dus" ? "boxes" : "pairs"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stockCardData.movements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>From/To</TableHead>
                    <TableHead className="text-right">In</TableHead>
                    <TableHead className="text-right">Out</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockCardData.movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {movement.transactionDate instanceof Date
                          ? format(movement.transactionDate, "dd MMM yyyy")
                          : format(
                              new Date(movement.transactionDate),
                              "dd MMM yyyy",
                            )}
                      </TableCell>
                      <TableCell>{movement.transactionType}</TableCell>
                      <TableCell>{movement.referenceNumber || "-"}</TableCell>
                      <TableCell>
                        {movement.fromLocation
                          ? `From: ${movement.fromLocation}`
                          : movement.toLocation
                            ? `To: ${movement.toLocation}`
                            : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {movement.masukQty || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {movement.keluarQty || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {movement.saldoAkhir}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-muted-foreground"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">
                  No movement data found
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
                  There are no stock movements recorded for the selected
                  criteria in this time period.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {stockCardData.movements.length > 0 ? (
                <>
                  Showing data from{" "}
                  {format(
                    stockCardData.movements[0]?.transactionDate instanceof Date
                      ? stockCardData.movements[0].transactionDate
                      : new Date(
                          stockCardData.movements[0]?.transactionDate ||
                            Date.now(),
                        ),
                    "dd MMM yyyy",
                  )}{" "}
                  to{" "}
                  {format(
                    stockCardData.movements[stockCardData.movements.length - 1]
                      ?.transactionDate instanceof Date
                      ? stockCardData.movements[
                          stockCardData.movements.length - 1
                        ].transactionDate
                      : new Date(
                          stockCardData.movements[
                            stockCardData.movements.length - 1
                          ]?.transactionDate || Date.now(),
                        ),
                    "dd MMM yyyy",
                  )}
                </>
              ) : (
                "No data to display"
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              Print
            </Button>
          </CardFooter>
        </Card>
      ) : form.formState.isSubmitted ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-muted-foreground"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">No data available</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
              We couldn't find any stock card data for the selected parameters.
              Please try different filter options.
            </p>
            <Button variant="outline" onClick={() => form.reset()}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
