import { Location } from "../models/Location";
import { supabase } from "../lib/supabaseClient";

// Get all locations
export const getLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase.from("locations").select("*");

  if (error) {
    console.error("Error fetching locations:", error);
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }

  return (data as Location[]) || [];
};

// Get a single location by ID
export const getLocationById = async (
  id: number,
): Promise<Location | undefined> => {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("id", id)
    .single();

  // Error code 'PGRST116' means Row Not Found, which is valid (return undefined)
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching location by ID:", error);
    throw new Error(`Failed to fetch location details: ${error.message}`);
  }

  return data as Location | undefined;
};

// Create a new location
export const createLocation = async (location: Location): Promise<Location> => {
  const { data, error } = await supabase
    .from("locations")
    .insert([
      {
        location_name: location.location_name,
        location_type: location.location_type,
        address: location.address,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating location:", error);
    throw new Error(`Failed to create new location: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to get location data after creation.");
  }

  return data as Location;
};

// Update an existing location
export const updateLocation = async (
  id: number,
  location: Location,
): Promise<Location | undefined> => {
  const { data, error } = await supabase
    .from("locations")
    .update({
      location_name: location.location_name,
      location_type: location.location_type,
      address: location.address,
      // removed updated_at as it's not in the schema
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating location:", error);
    throw new Error(`Failed to update location: ${error.message}`);
  }

  if (!data) {
    return undefined;
  }

  return data as Location;
};

// Delete a location
export const deleteLocation = async (id: number): Promise<boolean> => {
  const { error } = await supabase.from("locations").delete().eq("id", id);

  if (error) {
    console.error("Error deleting location:", error);
    throw new Error(`Failed to delete location: ${error.message}`);
  }

  return true;
};
