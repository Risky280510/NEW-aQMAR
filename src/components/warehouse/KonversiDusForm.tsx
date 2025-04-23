import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getProducts } from "@/services/productService";
import { getColors } from "@/services/colorService";
import { convertBoxToUnit } from "@/services/warehouseService";
import { Product } from "@/models/Product";
import { Color } from "@/models/Color";

// Define the form schema using zod
const formSchema = z.object({
  productId: z.string().min(1, { message: "Product is required" }),
  colorId: z.string().min(1, { message: "Color is required" }),
  numberBoxes: z
    .string()
    .min(1, { message: "Number of boxes is required" })
    .refine((val) => !isNaN(Number(val)), { message: "Must be a number" })
    .refine((val) => Number(val) > 0, {
      message: "Number of boxes must be more than 0",
    }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

// Main warehouse ID constant
const WAREHOUSE_MAIN_ID = 1;

const KonversiDusForm: React.FC = () => {
  // State for products and colors
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast for notifications
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      colorId: "",
      numberBoxes: "",
    },
  });

  // Fetch products and colors on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    const fetchColors = async () => {
      try {
        const colorsData = await getColors();
        setColors(colorsData);
      } catch (error) {
        console.error("Failed to fetch colors:", error);
        toast({
          title: "Error",
          description: "Failed to load colors. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingColors(false);
      }
    };

    fetchProducts();
    fetchColors();
  }, [toast]);

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      await convertBoxToUnit({
        productId: Number(data.productId),
        colorId: Number(data.colorId),
        numberBoxes: Number(data.numberBoxes),
        locationId: WAREHOUSE_MAIN_ID,
      });

      toast({
        title: "Success",
        description: `Successfully converted ${data.numberBoxes} boxes.`,
      });

      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle>Convert Boxes to Units</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    disabled={isLoadingProducts || isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
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
                    disabled={isLoadingColors || isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={String(color.id)}>
                          {color.color_name}
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
              name="numberBoxes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Boxes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter number of boxes"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoadingProducts || isLoadingColors}
              >
                {isSubmitting ? "Converting..." : "Convert"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default KonversiDusForm;
