import { Size, defaultSize } from "../models/Size";
import { supabase } from "../lib/supabaseClient";

// Get all sizes
const getSizes = async (): Promise<Size[]> => {
  try {
    const { data, error } = await supabase.from("sizes").select("*");

    if (error) {
      console.error("Error fetching sizes:", error);
      throw new Error(`Failed to fetch sizes: ${error.message}`);
    }

    return data as Size[];
  } catch (error) {
    console.error("Error in getSizes:", error);
    throw new Error("Failed to fetch sizes. Please try again later.");
  }
};

// Get a single size by ID
const getSizeById = async (id: number | string): Promise<Size | null> => {
  try {
    const { data, error } = await supabase
      .from("sizes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 is the error code for "no rows returned"
        return null;
      }
      console.error(`Error fetching size with ID ${id}:`, error);
      throw new Error(`Failed to fetch size: ${error.message}`);
    }

    return data as Size;
  } catch (error) {
    console.error(`Error in getSizeById for ID ${id}:`, error);
    throw new Error("Failed to fetch size. Please try again later.");
  }
};

// Create a new size
const createSize = async (size: Size): Promise<Size> => {
  try {
    // Ensure we only send the size_name field
    const { data, error } = await supabase
      .from("sizes")
      .insert([{ size_name: size.size_name }])
      .select()
      .single();

    if (error) {
      console.error("Error creating size:", error);
      throw new Error(`Failed to create size: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to create size: No data returned");
    }

    return data as Size;
  } catch (error) {
    console.error("Error in createSize:", error);
    throw new Error("Failed to create size. Please try again later.");
  }
};

// Update an existing size
const updateSize = async (id: number | string, size: Size): Promise<Size> => {
  try {
    // Ensure we only send the size_name field
    const { data, error } = await supabase
      .from("sizes")
      .update({ size_name: size.size_name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating size with ID ${id}:`, error);
      throw new Error(`Failed to update size: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Failed to update size with ID ${id}: No data returned`);
    }

    return data as Size;
  } catch (error) {
    console.error(`Error in updateSize for ID ${id}:`, error);
    throw new Error("Failed to update size. Please try again later.");
  }
};

// Delete a size
const deleteSize = async (id: number | string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("sizes").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting size with ID ${id}:`, error);
      throw new Error(`Failed to delete size: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteSize for ID ${id}:`, error);
    throw new Error("Failed to delete size. Please try again later.");
  }
};

// Export as a named export for use in components
export const sizeService = {
  getSizes,
  getSizeById,
  createSize,
  updateSize,
  deleteSize,
};

// Also export individual functions for direct imports if needed
export { getSizes, getSizeById, createSize, updateSize, deleteSize };
