import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProduct } from "../../services/productService";
import { defaultProduct } from "../../models/Product";

// Import ShadCN UI components
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useToast } from "../../components/ui/use-toast";

// Define form validation schema
const formSchema = z.object({
  product_sku: z.string().min(1, "Product SKU is required"),
  product_name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  isi_dus: z.coerce
    .number()
    .min(1, "Box content must be greater than 0")
    .int("Box content must be a whole number"),
});

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_sku: defaultProduct.product_sku,
      product_name: defaultProduct.product_name,
      category: defaultProduct.category,
      isi_dus: defaultProduct.isi_dus,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      await createProduct(values);
      toast({
        title: "Product created",
        description: "The product has been successfully created.",
      });
      navigate("/master/products");
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Failed to create product. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create product. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="product_sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the unique SKU code for this product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Running Shoes" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the name of the product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Footwear" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the product category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isi_dus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Box Content</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="12"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the number of items per box.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/master/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
