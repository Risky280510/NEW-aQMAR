import { supabase } from "../lib/supabaseClient";
import { Product, defaultProduct } from "../models/Product";

// Define Size interface
export interface Size {
  id: number;
  size_name: string;
  created_at?: string;
  updated_at?: string;
}

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data as Product[];
  } catch (error) {
    console.error("Unexpected error fetching products:", error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (
  id: number | string,
): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error(`Error fetching product with ID ${id}:`, error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data as Product;
  } catch (error) {
    console.error(`Unexpected error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Get available sizes for a product
export const getSizesForProduct = async (
  productId: number,
): Promise<Size[]> => {
  try {
    console.log(`Fetching sizes for product ID: ${productId}`);

    // Query the product_sizes table to get size IDs for this product
    const { data: productSizesData, error: productSizesError } = await supabase
      .from("product_sizes")
      .select("size_id")
      .eq("product_id", productId);

    if (productSizesError) {
      console.error(
        `Error fetching product sizes for product ID ${productId}:`,
        productSizesError,
      );
      throw new Error(
        `Failed to fetch product sizes: ${productSizesError.message}`,
      );
    }

    if (!productSizesData || productSizesData.length === 0) {
      return [];
    }

    // Extract size IDs from the result
    const sizeIds = productSizesData.map((item) => item.size_id);

    // Get the sizes from the sizes table
    const { data: sizesData, error: sizesError } = await supabase
      .from("sizes")
      .select("*")
      .in("id", sizeIds);

    if (sizesError) {
      console.error(
        `Error fetching sizes for product ID ${productId}:`,
        sizesError,
      );
      throw new Error(`Failed to fetch sizes: ${sizesError.message}`);
    }

    return sizesData as Size[];
  } catch (error) {
    console.error(
      `Unexpected error fetching sizes for product ID ${productId}:`,
      error,
    );
    throw error;
  }
};

// Create a new product
export const createProduct = async (
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      if (error.code === "23505") {
        throw new Error(
          `Product with SKU '${product.product_sku}' already exists`,
        );
      }
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data as Product;
  } catch (error) {
    console.error("Unexpected error creating product:", error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (
  id: number | string,
  product: Partial<Omit<Product, "id" | "created_at" | "updated_at">>,
): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      if (error.code === "23505") {
        throw new Error(
          `Product with SKU '${product.product_sku}' already exists`,
        );
      }
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data as Product;
  } catch (error) {
    console.error(`Unexpected error updating product with ID ${id}:`, error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: number | string): Promise<void> => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  } catch (error) {
    console.error(`Unexpected error deleting product with ID ${id}:`, error);
    throw error;
  }
};
