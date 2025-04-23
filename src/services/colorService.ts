import { Color, defaultColor } from "../models/Color";
import { supabase } from "../lib/supabaseClient";

// Get all colors
const getColors = async (): Promise<Color[]> => {
  try {
    const { data, error } = await supabase.from("colors").select("*");

    if (error) {
      console.error("Error fetching colors:", error);
      throw new Error(`Failed to fetch colors: ${error.message}`);
    }

    return data as Color[];
  } catch (error) {
    console.error("Error in getColors:", error);
    throw new Error("Failed to fetch colors. Please try again later.");
  }
};

// Get a single color by ID
const getColorById = async (id: number | string): Promise<Color | null> => {
  try {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 is the error code for "no rows returned"
        return null;
      }
      console.error(`Error fetching color with ID ${id}:`, error);
      throw new Error(`Failed to fetch color: ${error.message}`);
    }

    return data as Color;
  } catch (error) {
    console.error(`Error in getColorById for ID ${id}:`, error);
    throw new Error("Failed to fetch color. Please try again later.");
  }
};

// Create a new color
const createColor = async (color: Color): Promise<Color> => {
  try {
    // Ensure we only send the color_name field
    const { data, error } = await supabase
      .from("colors")
      .insert([{ color_name: color.color_name }])
      .select()
      .single();

    if (error) {
      console.error("Error creating color:", error);
      throw new Error(`Failed to create color: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to create color: No data returned");
    }

    return data as Color;
  } catch (error) {
    console.error("Error in createColor:", error);
    throw new Error("Failed to create color. Please try again later.");
  }
};

// Update an existing color
const updateColor = async (
  id: number | string,
  color: Color,
): Promise<Color> => {
  try {
    // Ensure we only send the color_name field
    const { data, error } = await supabase
      .from("colors")
      .update({ color_name: color.color_name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating color with ID ${id}:`, error);
      throw new Error(`Failed to update color: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Failed to update color with ID ${id}: No data returned`);
    }

    return data as Color;
  } catch (error) {
    console.error(`Error in updateColor for ID ${id}:`, error);
    throw new Error("Failed to update color. Please try again later.");
  }
};

// Delete a color
const deleteColor = async (id: number | string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("colors").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting color with ID ${id}:`, error);
      throw new Error(`Failed to delete color: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteColor for ID ${id}:`, error);
    throw new Error("Failed to delete color. Please try again later.");
  }
};

// Export as a named export for use in components
export const colorService = {
  getColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
};

// Also export individual functions for direct imports if needed
export { getColors, getColorById, createColor, updateColor, deleteColor };
