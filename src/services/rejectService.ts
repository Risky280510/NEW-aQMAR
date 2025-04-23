import { supabase } from "../lib/supabaseClient";
import { Reject, RecordRejectInput, RejectListItem } from "../models/Reject";

// Record a new reject
export const recordReject = async (
  data: RecordRejectInput,
): Promise<Reject> => {
  try {
    // TODO: Implement as backend transaction (Supabase Function/RPC) for atomicity

    // 1. Validate stock availability in inventory_pasang
    const { data: stockData, error: stockError } = await supabase
      .from("inventory_pasang")
      .select("id, stok_pasang")
      .eq("location_id", data.locationId)
      .eq("product_id", data.productId)
      .eq("color_id", data.colorId)
      .eq("size_id", data.sizeId)
      .single();

    if (stockError) {
      console.error("Error checking inventory stock:", stockError);
      throw new Error(`Failed to check inventory stock: ${stockError.message}`);
    }

    if (!stockData || stockData.stok_pasang < data.quantity) {
      throw new Error("Insufficient stock for the reject operation");
    }

    // 2. Insert into inventory_riject table
    const { data: rejectData, error: rejectError } = await supabase
      .from("inventory_riject")
      .insert({
        location_id: data.locationId,
        product_id: data.productId,
        color_id: data.colorId,
        size_id: data.sizeId,
        quantity: data.quantity,
        reject_date: data.rejectDate.toISOString(),
        reason: data.reason,
        status: "New", // Default status for new rejects
        notes: null, // Optional notes
      })
      .select()
      .single();

    if (rejectError) {
      console.error("Error recording reject:", rejectError);
      throw new Error(`Failed to record reject: ${rejectError.message}`);
    }

    // 3. Reduce stock in inventory_pasang
    const newStock = stockData.stok_pasang - data.quantity;
    const { error: updateError } = await supabase
      .from("inventory_pasang")
      .update({ stok_pasang: newStock })
      .eq("id", stockData.id);

    if (updateError) {
      console.error("Error updating inventory stock:", updateError);
      throw new Error(
        `Failed to update inventory stock: ${updateError.message}`,
      );
    }

    // 4. Record in inventory_transactions
    const { error: transactionError } = await supabase
      .from("inventory_transactions")
      .insert({
        type: "REJECT",
        location_id: data.locationId,
        product_id: data.productId,
        color_id: data.colorId,
        size_id: data.sizeId,
        jumlah_pasang: data.quantity,
        transaction_date: data.rejectDate.toISOString(),
        notes: `Reject: ${data.reason}`,
        reference_id: rejectData.id.toString(),
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      throw new Error(
        `Failed to record transaction: ${transactionError.message}`,
      );
    }

    return rejectData as Reject;
  } catch (error) {
    console.error("Error in recordReject:", error);
    throw error;
  }
};

// Get all rejects
export const getRejects = async (): Promise<Reject[]> => {
  try {
    const { data, error } = await supabase
      .from("inventory_riject")
      .select("*")
      .order("reject_date", { ascending: false });

    if (error) {
      console.error("Error fetching rejects:", error);
      throw new Error(`Failed to fetch rejects: ${error.message}`);
    }

    return data as Reject[];
  } catch (error) {
    console.error("Error in getRejects:", error);
    throw error;
  }
};

// Get rejects by location
export const getRejectsByLocation = async (
  locationId: number,
): Promise<Reject[]> => {
  try {
    const { data, error } = await supabase
      .from("inventory_riject")
      .select("*")
      .eq("location_id", locationId)
      .order("reject_date", { ascending: false });

    if (error) {
      console.error("Error fetching rejects by location:", error);
      throw new Error(`Failed to fetch rejects by location: ${error.message}`);
    }

    return data as Reject[];
  } catch (error) {
    console.error("Error in getRejectsByLocation:", error);
    throw error;
  }
};

// Get reject list items with optional filters
export const getRejectListItems = async (filters?: {
  locationId?: number;
  dateRange?: [Date, Date];
  status?: string;
}): Promise<RejectListItem[]> => {
  try {
    // Build the query with joins to get all required data
    let query = supabase.from("inventory_riject").select(`
        id,
        reject_date,
        quantity,
        reason,
        status,
        locations:location_id(location_name),
        products:product_id(product_name),
        colors:color_id(color_name),
        sizes:size_id(size_name)
      `);

    // Apply filters if provided
    if (filters) {
      if (filters.locationId) {
        query = query.eq("location_id", filters.locationId);
      }

      if (filters.dateRange && filters.dateRange.length === 2) {
        const [startDate, endDate] = filters.dateRange;
        query = query
          .gte("reject_date", startDate.toISOString())
          .lte("reject_date", endDate.toISOString());
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
    }

    // Order by most recent date
    query = query.order("reject_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reject list items:", error);
      throw new Error(`Failed to fetch reject list items: ${error.message}`);
    }

    // Transform the data to match the RejectListItem interface
    const rejectListItems: RejectListItem[] = data.map((item: any) => ({
      id: item.id,
      rejectDate: item.reject_date,
      locationName: item.locations?.location_name || "Unknown Location",
      productName: item.products?.product_name || "Unknown Product",
      colorName: item.colors?.color_name || "Unknown Color",
      sizeName: item.sizes?.size_name || "Unknown Size",
      quantity: item.quantity,
      reason: item.reason,
      statusRijek: item.status,
    }));

    return rejectListItems;
  } catch (error) {
    console.error("Error in getRejectListItems:", error);
    throw error;
  }
};

// Get a single reject by ID
export const getRejectById = async (
  id: number,
): Promise<Reject | undefined> => {
  try {
    const { data, error } = await supabase
      .from("inventory_riject")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return undefined;
      }
      console.error("Error fetching reject by ID:", error);
      throw new Error(`Failed to fetch reject by ID: ${error.message}`);
    }

    return data as Reject;
  } catch (error) {
    console.error("Error in getRejectById:", error);
    throw error;
  }
};
