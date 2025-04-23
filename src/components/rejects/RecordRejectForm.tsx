import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Services
import { getLocations } from "@/services/locationService";
import {
  getProducts,
  getSizesForProduct,
  Size,
} from "@/services/productService";
import { getColors } from "@/services/colorService";
import { recordReject } from "@/services/rejectService";

// Types
import { Location } from "@/models/Location";
import { Product } from "@/models/Product";
import { Color } from "@/models/Color";
import { RecordRejectInput } from "@/models/Reject";

// Form schema
const formSchema = z.object({
  locationId: z.coerce.number().positive("Please select a location"),
  productId: z.coerce.number().positive("Please select a product"),
  colorId: z.coerce.number().positive("Please select a color"),
  sizeId: z.coerce.number().positive("Please select a size"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  rejectDate: z.date({
    required_error: "Please select a date",
  }),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const RecordRejectForm = () => {
  const navigate = useNavigate();

  // State for master data
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSizesLoading, setIsSizesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: 0,
      productId: 0,
      colorId: 0,
      sizeId: 0,
      quantity: 1,
      rejectDate: new Date(),
      reason: "",
    },
  });

  // Watch for product changes to load sizes
  const watchProductId = form.watch("productId");

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      setIsLoading(true);
      try {
        const [locationsData, productsData, colorsData] = await Promise.all([
          getLocations(),
          getProducts(),
          getColors(),
        ]);

        setLocations(locationsData);
        setProducts(productsData);
        setColors(colorsData);
      } catch (error) {
        console.error("Error loading master data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMasterData();
  }, []);

  // Load sizes when product changes
  useEffect(() => {
    const loadSizes = async () => {
      if (watchProductId && watchProductId > 0) {
        setIsSizesLoading(true);
        try {
          const sizesData = await getSizesForProduct(watchProductId);
          setSizes(sizesData);
        } catch (error) {
          console.error("Error loading sizes:", error);
        } finally {
          setIsSizesLoading(false);
        }
      } else {
        setSizes([]);
      }
    };

    loadSizes();
  }, [watchProductId]);

  // Form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const rejectData: RecordRejectInput = {
        locationId: data.locationId,
        productId: data.productId,
        colorId: data.colorId,
        sizeId: data.sizeId,
        quantity: data.quantity,
        rejectDate: data.rejectDate,
        reason: data.reason,
      };

      await recordReject(rejectData);

      // Show success message (would use Toast in a real app)
      alert("Successfully saved rejected data");

      // Reset form
      form.reset();

      // Navigate back to list (if needed)
      // navigate("/warehouse/rejects");
    } catch (error) {
      console.error("Error recording reject:", error);
      // Show error message (would use Toast in a real app)
      alert("Failed to save rejected data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Record Rejected Goods</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Reject Date */}
            <FormField
              control={form.control}
              name="rejectDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Reject Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
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

            {/* Product */}
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ""}
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
                          {product.product_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color */}
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ""}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size */}
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    disabled={isSizesLoading || !watchProductId}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            watchProductId
                              ? "Select a size"
                              : "Select a product first"
                          }
                        />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of rejected pairs/units
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why the item is being rejected"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-between px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Rejected Data"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RecordRejectForm;
