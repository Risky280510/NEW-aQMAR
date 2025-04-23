import { supabase } from "../lib/supabaseClient";

export interface AppSettings {
  appName: string; // Application Name (Example: "XYZ Inventory System") - Required
  companyName?: string; // Company Name (Optional)
  address?: string; // Company Address (Optional, can be Textarea)
  logoUrl?: string; // URL to the logo file (For starters we use URL, uploading a file can be an enhancement) - Optional
  defaultCurrency?: string; // Default Currency (e.g. 'IDR') - Optional
  dateFormat?: string; // Default Date Format (e.g. 'DD/MM/YYYY') - Optional
}

/**
 * Get application settings
 * @returns Promise with AppSettings object
 */
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching app settings:", error);
      throw new Error(`Failed to fetch app settings: ${error.message}`);
    }

    return data as AppSettings;
  } catch (error) {
    console.error("Unexpected error in getAppSettings:", error);
    // Fallback default settings if no settings exist in the database
    return {
      appName: "Inventory Management System",
      companyName: "Your Company",
      defaultCurrency: "IDR",
      dateFormat: "DD/MM/YYYY",
    };
  }
};

/**
 * Update application settings
 * @param data Updated AppSettings object
 * @returns Promise with updated AppSettings object
 */
export const updateAppSettings = async (
  data: AppSettings,
): Promise<AppSettings> => {
  try {
    // Check if settings already exist
    const { data: existingData, error: checkError } = await supabase
      .from("app_settings")
      .select("*")
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // Ignore 'row not found' error
      console.error("Error checking existing settings:", checkError);
      throw new Error(
        `Failed to check existing settings: ${checkError.message}`,
      );
    }

    let result;

    if (existingData) {
      // Update existing settings
      const { data: updatedData, error: updateError } = await supabase
        .from("app_settings")
        .update(data)
        .eq("id", existingData.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating app settings:", updateError);
        throw new Error(
          `Failed to update app settings: ${updateError.message}`,
        );
      }

      result = updatedData;
    } else {
      // Insert new settings
      const { data: newData, error: insertError } = await supabase
        .from("app_settings")
        .insert(data)
        .select()
        .single();

      if (insertError) {
        console.error("Error creating app settings:", insertError);
        throw new Error(
          `Failed to create app settings: ${insertError.message}`,
        );
      }

      result = newData;
    }

    return result as AppSettings;
  } catch (error) {
    console.error("Unexpected error in updateAppSettings:", error);
    throw error;
  }
};
