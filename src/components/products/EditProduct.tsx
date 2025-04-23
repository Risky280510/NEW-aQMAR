import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import * as productService from "@/services/productService";
import { Product } from "@/models/Product";

const formSchema = z.object({
  product_sku: z.string().min(2, {
    message: "SKU must be at least 2 characters.",
  }),
  product_name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  isi_dus: z.coerce
    .number()
    .min(1, {
      message: "Box content must be at least 1.",
    })
    .int("Box content must be a whole number"),
});

type FormValues = z.infer<typeof formSchema>;

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_sku: "",
      product_name: "",
      category: "",
      isi_dus: 0,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const product = await productService.getProductById(Number(id));
        if (product) {
          form.reset({
            product_sku: product.product_sku,
            product_name: product.product_name,
            category: product.category,
            isi_dus: product.isi_dus,
          });
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to fetch product data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, form]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;

    setIsLoadingUpdate(true);

    try {
      const productData: Product = {
        ...data,
        id: Number(id),
      };

      await productService.updateProduct(Number(id), productData);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      navigate("/master/products");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading product data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/master/products")}
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

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
                      The unique stock keeping unit for this product.
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
                      The display name of the product.
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
                      The category this product belongs to.
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      The number of items per box.
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
                <Button type="submit" disabled={isLoadingUpdate}>
                  {isLoadingUpdate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
