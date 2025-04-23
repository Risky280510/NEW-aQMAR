import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Product } from "@/models/Product";
import { Color } from "@/models/Color";
import { Size, getSizesForProduct } from "@/services/productService";
import {
  StockAdjustmentData,
  getCurrentDusStock,
  getCurrentPasangStock,
  adjustStock,
} from "@/services/warehouseService";
import { getProducts } from "@/services/productService";
import { getLocationById } from "@/services/locationService";

// Default location ID (fallback)
const DEFAULT_LOCATION_ID = 1;

// Define the form schema with Zod
const formSchema = z
  .object({
    type: z.enum(["dus", "pasang"], {
      required_error: "Please select a stock type",
    }),
    productId: z.string().min(1, "Please select a product"),
    colorId: z.string().min(1, "Please select a color"),
    sizeId: z.string().optional(),
    physicalCount: z.number().min(0, "Physical count must be 0 or greater"),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      // If type is pasang, sizeId is required
      if (data.type === "pasang") {
        return !!data.sizeId;
      }
      return true;
    },
    {
      message: "Size is required for pasang stock type",
      path: ["sizeId"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const StockOpnameAdjustment = () => {
  // Get location ID from URL params
  const { locationId } = useParams<{ locationId: string }>();
  const currentLocationId = locationId
    ? parseInt(locationId, 10)
    : DEFAULT_LOCATION_ID;

  // State for location name
  const [locationName, setLocationName] = useState<string>("");
  // State for master data
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  // State for current system stock
  const [currentSystemStock, setCurrentSystemStock] = useState<number | null>(
    null,
  );
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "dus",
      productId: "",
      colorId: "",
      sizeId: "",
      physicalCount: 0,
      reason: "",
    },
  });

  // Watch form values for dependencies
  const watchType = form.watch("type");
  const watchProductId = form.watch("productId");
  const watchColorId = form.watch("colorId");
  const watchSizeId = form.watch("sizeId");

  // Fetch location name on component mount
  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        const location = await getLocationById(currentLocationId);
        if (location) {
          setLocationName(location.location_name);
        }
      } catch (error) {
        console.error("Failed to fetch location:", error);
      }
    };

    fetchLocationName();
  }, [currentLocationId]);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Fetch colors on component mount
  useEffect(() => {
    const fetchColors = async () => {
      try {
        // In a real app, this would call a service function
        // For now, we'll use mock data
        const mockColors: Color[] = [
          { id: 1, color_name: "Red" },
          { id: 2, color_name: "Blue" },
          { id: 3, color_name: "Green" },
          { id: 4, color_name: "Black" },
          { id: 5, color_name: "White" },
        ];
        setColors(mockColors);
      } catch (error) {
        console.error("Failed to fetch colors:", error);
      }
    };

    fetchColors();
  }, []);

  // Fetch sizes based on selected product
  useEffect(() => {
    const fetchSizes = async () => {
      if (!watchProductId) {
        setSizes([]);
        return;
      }

      try {
        const sizesData = await getSizesForProduct(parseInt(watchProductId));
        setSizes(sizesData);
      } catch (error) {
        console.error("Failed to fetch sizes:", error);
        setSizes([]);
      }
    };

    fetchSizes();
  }, [watchProductId]);

  // Fetch current system stock
  useEffect(() => {
    const fetchCurrentStock = async () => {
      if (!watchProductId || !watchColorId) {
        setCurrentSystemStock(null);
        setStockError(null);
        return;
      }

      // If type is pasang, we also need sizeId
      if (watchType === "pasang" && !watchSizeId) {
        setCurrentSystemStock(null);
        setStockError(null);
        return;
      }

      setIsLoadingStock(true);
      setStockError(null);

      try {
        let stock: number | null = null;

        if (watchType === "dus") {
          stock = await getCurrentDusStock(
            currentLocationId,
            parseInt(watchProductId),
            parseInt(watchColorId),
          );
        } else if (watchType === "pasang" && watchSizeId) {
          stock = await getCurrentPasangStock(
            currentLocationId,
            parseInt(watchProductId),
            parseInt(watchColorId),
            parseInt(watchSizeId),
          );
        }

        setCurrentSystemStock(stock);
        if (stock === null) {
          setStockError("No stock data found for the selected item");
        }
      } catch (error) {
        console.error("Failed to fetch current stock:", error);
        setStockError(
          `Failed to fetch stock: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setCurrentSystemStock(null);
      } finally {
        setIsLoadingStock(false);
      }
    };

    fetchCurrentStock();
  }, [watchType, watchProductId, watchColorId, watchSizeId]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Ensure we have the current system stock
      if (currentSystemStock === null) {
        throw new Error("System stock not available");
      }

      // Prepare the adjustment data
      const adjustmentData: StockAdjustmentData = {
        locationId: currentLocationId,
        type: values.type,
        productId: parseInt(values.productId),
        colorId: parseInt(values.colorId),
        sizeId: values.sizeId ? parseInt(values.sizeId) : undefined,
        physicalCount: values.physicalCount,
        systemCount: currentSystemStock,
        reason: values.reason,
      };

      // Call the service to adjust the stock
      await adjustStock(adjustmentData);

      // Reset form and state
      form.reset();
      setCurrentSystemStock(null);
      alert("Stock adjusted successfully");
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      alert(
        `Failed to adjust stock: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>
          Stock Opname Adjustment {locationName && `- ${locationName}`}
        </CardTitle>
        <CardDescription>
          Adjust stock levels based on physical count results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Stock Type Field */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stock type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dus">Box (Dus)</SelectItem>
                      <SelectItem value="pasang">Pair (Pasang)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Field */}
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
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
                  <FormDescription>
                    Select the product to adjust stock for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Field */}
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting || !watchProductId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
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
                  <FormDescription>Select the color variant</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size Field (conditional for pasang type) */}
            {watchType === "pasang" && (
              <FormField
                control={form.control}
                name="sizeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={
                        isSubmitting || !watchProductId || !watchColorId
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a size" />
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
                      Select the size for pair stock
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* System Stock Display */}
            <div className="p-4 border rounded-md bg-slate-50">
              <div className="font-medium mb-2">Current System Stock</div>
              {isLoadingStock ? (
                <div className="flex items-center text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading current stock...
                </div>
              ) : stockError ? (
                <div className="text-sm text-red-500">{stockError}</div>
              ) : currentSystemStock !== null ? (
                <div className="text-lg font-semibold">
                  {currentSystemStock}{" "}
                  {watchType === "dus" ? "box(es)" : "pair(s)"}
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Select product, color{watchType === "pasang" && ", and size"}{" "}
                  to view current stock
                </div>
              )}
            </div>

            {/* Physical Count Field */}
            <FormField
              control={form.control}
              name="physicalCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter physical count"
                      disabled={
                        isSubmitting ||
                        !watchProductId ||
                        !watchColorId ||
                        (watchType === "pasang" && !watchSizeId)
                      }
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseInt(value, 10));
                      }}
                      value={field.value.toString()}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the actual physical count from inventory check
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason Field */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for adjustment"
                      className="resize-none"
                      disabled={
                        isSubmitting ||
                        !watchProductId ||
                        !watchColorId ||
                        (watchType === "pasang" && !watchSizeId)
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a reason for the stock adjustment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adjusting...
                </>
              ) : (
                "Adjust Stock"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StockOpnameAdjustment;
