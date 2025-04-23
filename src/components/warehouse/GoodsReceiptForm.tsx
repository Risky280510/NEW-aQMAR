import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Product } from "@/models/Product";
import { Color } from "@/models/Color";
import { getProducts } from "@/services/productService";
import { getColors } from "@/services/colorService";
import { warehouseService, GoodsReceipt } from "@/services/warehouseService";

// Define the form schema with Zod
const formSchema = z.object({
  receipt_date: z.string().min(1, { message: "Receipt date is required" }),
  product_id: z.number().positive({ message: "Product is required" }),
  color_id: z.number().positive({ message: "Color is required" }),
  box_count: z
    .number()
    .positive({ message: "Box count must be greater than 0" }),
  supplier: z.string().optional(),
  reference_number: z.string().optional(),
});

// Define the type for our form values
type GoodsReceiptFormValues = z.infer<typeof formSchema>;

const GoodsReceiptForm: React.FC = () => {
  // Get toast function for notifications
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for products, colors, and form status
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products and colors when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch products and colors in parallel
        const [productsData, colorsData] = await Promise.all([
          getProducts(),
          getColors(),
        ]);

        setProducts(productsData);
        setColors(colorsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load products and colors. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize the form
  const form = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receipt_date: format(new Date(), "yyyy-MM-dd"),
      product_id: 0,
      color_id: 0,
      box_count: 0,
      supplier: "",
      reference_number: "",
    },
  });

  // Function to handle form submission
  const onSubmit = async (data: GoodsReceiptFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the selected product to access its isi_dus value
      const selectedProduct = products.find((p) => p.id === data.product_id);

      if (!selectedProduct) {
        throw new Error("Selected product not found");
      }

      // Calculate bun_count from box_count and isi_dus
      const bun_count = data.box_count * selectedProduct.isi_dus;

      // Prepare the goods receipt data
      const goodsReceiptData: GoodsReceipt = {
        receipt_date: data.receipt_date,
        product_id: data.product_id,
        color_id: data.color_id,
        bun_count: bun_count,
        supplier: data.supplier || undefined,
        reference_number: data.reference_number || undefined,
        location_id: 1, // Set a default location ID (main warehouse)
      };

      // Call the service to create the goods receipt
      const result =
        await warehouseService.createGoodsReceipt(goodsReceiptData);

      // Show success toast
      toast({
        title: "Success",
        description: `Goods receipt created successfully. Receipt ID: ${result.id}`,
        variant: "default",
      });

      // Reset the form
      form.reset({
        receipt_date: format(new Date(), "yyyy-MM-dd"),
        product_id: undefined,
        color_id: undefined,
        box_count: undefined,
        supplier: "",
        reference_number: "",
      });

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to the receipts list after a short delay
      setTimeout(() => {
        navigate("/warehouse/receipts");
      }, 1500);
    } catch (err) {
      console.error("Error creating goods receipt:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create goods receipt",
      );

      // Show error toast
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create goods receipt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Record Goods Receipt</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Receipt Date Field */}
                <FormField
                  control={form.control}
                  name="receipt_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Product Selection Field */}
                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value, 10))
                        }
                        value={field.value ? field.value.toString() : undefined}
                        defaultValue={undefined}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Color Selection Field */}
                <FormField
                  control={form.control}
                  name="color_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value, 10))
                        }
                        value={field.value ? field.value.toString() : undefined}
                        defaultValue={undefined}
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

                {/* Box Count Field */}
                <FormField
                  control={form.control}
                  name="box_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Boxes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          value={isNaN(field.value) ? 0 : field.value}
                          onChange={(e) =>
                            field.onChange(
                              isNaN(e.target.valueAsNumber)
                                ? 0
                                : e.target.valueAsNumber,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Supplier Field */}
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional: Enter the supplier name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reference Number Field */}
                <FormField
                  control={form.control}
                  name="reference_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional: Enter a reference number for this receipt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Receipt"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default GoodsReceiptForm;
