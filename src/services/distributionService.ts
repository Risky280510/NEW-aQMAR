import {
  CreateTransferInput,
  Transfer,
  TransferHistoryItem,
} from "../models/Transfer";

// Mock data for development
let transfers: Transfer[] = [];

// Mock location names for development
const mockLocationNames = {
  1: "Jakarta Warehouse",
  2: "Bandung Store",
  3: "Surabaya Distribution Center",
  4: "Bali Outlet",
  5: "Medan Warehouse",
};

// Mock location addresses for development
const mockLocationAddresses = {
  1: "Jl. Industri Raya No. 45, Jakarta Utara",
  2: "Jl. Riau No. 123, Bandung",
  3: "Jl. Raya Darmo No. 56, Surabaya",
  4: "Jl. Sunset Road No. 88, Kuta, Bali",
  5: "Jl. Gatot Subroto No. 77, Medan",
};

// Mock product names for development
const mockProductNames = {
  1: "Sport Shoes",
  2: "Casual Shoes",
  3: "Formal Shoes",
  4: "Sandals",
  5: "Boots",
};

// Mock product SKUs for development
const mockProductSKUs = {
  1: "SPT-001",
  2: "CSL-002",
  3: "FML-003",
  4: "SND-004",
  5: "BTS-005",
};

// Mock color names for development
const mockColorNames = {
  1: "Black",
  2: "White",
  3: "Red",
  4: "Blue",
  5: "Green",
};

// Mock size names for development
const mockSizeNames = {
  1: "36",
  2: "37",
  3: "38",
  4: "39",
  5: "40",
  6: "41",
  7: "42",
  8: "43",
};

// Define interface for transfer detail item
export interface TransferDetailItem {
  skuProduk?: string;
  productName: string;
  colorName: string;
  sizeName?: string; // Only exists if the transfer is paired
  quantity: number; // Amount transferred (dus or pasang)
}

// Define interface for transfer details
export interface TransferDetails {
  id: number | string; // Unique ID of the Transfer
  transferNumber?: string; // Delivery Note/Transfer Number (if any)
  transferDate: string | Date;
  sourceLocationName: string;
  sourceLocationAddress?: string; // Source address if any in the location data
  destinationLocationName: string;
  destinationLocationAddress?: string; // Destination address if any
  transferType: "dus" | "pasang"; // To specify the units in the table
  notes?: string;
  items: TransferDetailItem[]; // Array of transferred items
}

/**
 * Creates a stock transfer between locations
 *
 * @param data The transfer input data
 * @returns A promise that resolves to the created transfer
 */
export const createStockTransfer = async (
  data: CreateTransferInput,
): Promise<Transfer> => {
  // Validate input
  if (data.sourceLocationId === data.destinationLocationId) {
    throw new Error("Source and destination locations must be different");
  }

  // Validate items
  if (!data.items || data.items.length === 0) {
    throw new Error("At least one item must be included in the transfer");
  }

  // Validate each item
  for (const item of data.items) {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0 for all items");
    }

    // Simulate stock availability check
    // In a real app, this would query the database to check stock levels
    if (item.quantity > 10) {
      throw new Error(
        "Not enough stock at origin location for one or more items",
      );
    }
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For backward compatibility, we'll create a transfer record using the first item
  // In a real implementation, this would be updated to handle multiple items properly
  const firstItem = data.items[0];
  const newTransfer: Transfer = {
    id: Math.max(0, ...transfers.map((t) => t.id || 0)) + 1,
    sourceLocationId: data.sourceLocationId,
    destinationLocationId: data.destinationLocationId,
    transferType: data.transferType,
    productId: firstItem.productId,
    colorId: firstItem.colorId,
    sizeId: firstItem.sizeId,
    quantity: firstItem.quantity,
    transferDate: new Date(data.transferDate),
    notes: data.notes,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // In a real app, this would:
  // 1. Start a database transaction
  // 2. Create a transfer record in the transfers table
  // 3. Create transfer_items records for each item in the items array
  // 4. Reduce stock in source location for each item
  // 5. Increase stock in destination location for each item
  // 6. Record transactions in inventory_transactions table
  // 7. Commit the transaction

  // Add to our mock data
  transfers.push(newTransfer);

  // For now, we're only returning the first item's transfer record
  // In a real implementation, we would return a more comprehensive result
  return Promise.resolve(newTransfer);
};

/**
 * Gets all transfers
 *
 * @returns A promise that resolves to an array of transfers
 */
export const getTransfers = async (): Promise<Transfer[]> => {
  // In a real app, this would be an API call
  return Promise.resolve([...transfers]);
};

/**
 * Gets a transfer by ID
 *
 * @param id The transfer ID
 * @returns A promise that resolves to the transfer or undefined if not found
 */
export const getTransferById = async (
  id: number,
): Promise<Transfer | undefined> => {
  // In a real app, this would be an API call
  const transfer = transfers.find((t) => t.id === id);
  return Promise.resolve(transfer);
};

import { supabase } from "../lib/supabaseClient";

/**
 * Gets transfer history with optional filters
 *
 * @param filters Optional filters for the transfer history
 * @returns A promise that resolves to an array of transfer history items
 */
export const getTransferHistory = async (filters?: {
  dateRange?: [Date, Date];
  locationId?: number;
}): Promise<TransferHistoryItem[]> => {
  try {
    // Build the query to fetch transfers with related location data
    let query = supabase
      .from("stock_transfers")
      .select(
        `
        id,
        transfer_number,
        transfer_date,
        notes,
        status,
        source_location:source_location_id(id, location_name),
        destination_location:destination_location_id(id, location_name),
        stock_transfer_items(id, product_id, color_id, size_id, quantity, transfer_type)
      `,
      )
      .order("transfer_date", { ascending: false });

    // Apply date range filter if provided
    if (filters?.dateRange?.[0] && filters?.dateRange?.[1]) {
      query = query
        .gte("transfer_date", filters.dateRange[0].toISOString())
        .lte("transfer_date", filters.dateRange[1].toISOString());
    }

    // Apply location filter if provided
    if (filters?.locationId) {
      query = query.or(
        `source_location_id.eq.${filters.locationId},destination_location_id.eq.${filters.locationId}`,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching transfer history:", error);
      throw new Error(`Failed to fetch transfer history: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch products, colors, and sizes data for mapping
    const { data: productsData } = await supabase
      .from("products")
      .select("id, product_name");
    const { data: colorsData } = await supabase
      .from("colors")
      .select("id, color_name");
    const { data: sizesData } = await supabase
      .from("sizes")
      .select("id, size_name");

    // Create lookup maps for products, colors, and sizes
    const productsMap = new Map(
      productsData?.map((p) => [p.id, p.product_name]) || [],
    );
    const colorsMap = new Map(
      colorsData?.map((c) => [c.id, c.color_name]) || [],
    );
    const sizesMap = new Map(sizesData?.map((s) => [s.id, s.size_name]) || []);

    // Transform the data into TransferHistoryItem format
    const transferHistoryItems: TransferHistoryItem[] = [];

    data.forEach((transfer) => {
      // For each transfer, create a history item for each transfer item
      if (
        transfer.stock_transfer_items &&
        transfer.stock_transfer_items.length > 0
      ) {
        transfer.stock_transfer_items.forEach((item) => {
          transferHistoryItems.push({
            id: transfer.id,
            transferDate: transfer.transfer_date,
            sourceLocationName:
              transfer.source_location?.location_name ||
              `Location ${transfer.source_location_id}`,
            destinationLocationName:
              transfer.destination_location?.location_name ||
              `Location ${transfer.destination_location_id}`,
            productName:
              productsMap.get(item.product_id) || `Product ${item.product_id}`,
            colorName: colorsMap.get(item.color_id) || `Color ${item.color_id}`,
            sizeName: item.size_id
              ? sizesMap.get(item.size_id) || `Size ${item.size_id}`
              : undefined,
            quantity: item.quantity,
            transferType: item.transfer_type,
            status: transfer.status || "pending",
            notes: transfer.notes,
          });
        });
      } else {
        // If no items, create a placeholder history item
        transferHistoryItems.push({
          id: transfer.id,
          transferDate: transfer.transfer_date,
          sourceLocationName:
            transfer.source_location?.location_name ||
            `Location ${transfer.source_location_id}`,
          destinationLocationName:
            transfer.destination_location?.location_name ||
            `Location ${transfer.destination_location_id}`,
          productName: "Unknown Product",
          colorName: "Unknown Color",
          quantity: 0,
          transferType: "dus", // Default
          status: transfer.status || "pending",
          notes: transfer.notes,
        });
      }
    });

    return transferHistoryItems;
  } catch (error) {
    console.error("Error in getTransferHistory:", error);
    throw error;
  }
};

/**
 * Gets detailed information for a specific transfer
 *
 * @param transferId The ID of the transfer to retrieve details for
 * @returns A promise that resolves to the transfer details
 */
export const getTransferDetails = async (
  transferId: number | string,
): Promise<TransferDetails> => {
  try {
    // Fetch the stock transfer with its items and related data
    const { data: transfer, error: transferError } = await supabase
      .from("stock_transfers")
      .select(
        `
        id,
        transfer_number,
        transfer_date,
        notes,
        status,
        source_location:source_location_id(id, location_name, address),
        destination_location:destination_location_id(id, location_name, address),
        stock_transfer_items(id, product_id, color_id, size_id, quantity, transfer_type)
      `,
      )
      .eq("id", transferId)
      .single();

    if (transferError) {
      console.error(
        `Error fetching transfer details for ID ${transferId}:`,
        transferError,
      );
      throw new Error(
        `Failed to fetch transfer details: ${transferError.message}`,
      );
    }

    if (
      !transfer ||
      !transfer.stock_transfer_items ||
      transfer.stock_transfer_items.length === 0
    ) {
      throw new Error(
        `Transfer with ID ${transferId} not found or has no items`,
      );
    }

    // Get all product IDs, color IDs, and size IDs from the transfer items
    const productIds = [
      ...new Set(transfer.stock_transfer_items.map((item) => item.product_id)),
    ];
    const colorIds = [
      ...new Set(transfer.stock_transfer_items.map((item) => item.color_id)),
    ];
    const sizeIds = [
      ...new Set(
        transfer.stock_transfer_items
          .filter((item) => item.size_id)
          .map((item) => item.size_id),
      ),
    ];

    // Fetch products, colors, and sizes data
    const [productsResponse, colorsResponse, sizesResponse] = await Promise.all(
      [
        supabase
          .from("products")
          .select("id, product_name, product_sku")
          .in("id", productIds),
        supabase.from("colors").select("id, color_name").in("id", colorIds),
        sizeIds.length > 0
          ? supabase.from("sizes").select("id, size_name").in("id", sizeIds)
          : { data: [] },
      ],
    );

    if (productsResponse.error) {
      console.error("Error fetching products:", productsResponse.error);
      throw new Error(
        `Failed to fetch products: ${productsResponse.error.message}`,
      );
    }

    if (colorsResponse.error) {
      console.error("Error fetching colors:", colorsResponse.error);
      throw new Error(
        `Failed to fetch colors: ${colorsResponse.error.message}`,
      );
    }

    if (sizesResponse.error) {
      console.error("Error fetching sizes:", sizesResponse.error);
      throw new Error(`Failed to fetch sizes: ${sizesResponse.error.message}`);
    }

    // Create lookup maps
    const productsMap = new Map(productsResponse.data.map((p) => [p.id, p]));
    const colorsMap = new Map(colorsResponse.data.map((c) => [c.id, c]));
    const sizesMap = new Map(
      sizesResponse.data ? sizesResponse.data.map((s) => [s.id, s]) : [],
    );

    // Determine transfer type from the first item
    const transferType = transfer.stock_transfer_items[0].transfer_type as
      | "dus"
      | "pasang";

    // Map transfer items to TransferDetailItem format
    const items: TransferDetailItem[] = transfer.stock_transfer_items.map(
      (item) => {
        const product = productsMap.get(item.product_id);
        const color = colorsMap.get(item.color_id);

        const detailItem: TransferDetailItem = {
          skuProduk: product?.product_sku,
          productName: product?.product_name || `Product ${item.product_id}`,
          colorName: color?.color_name || `Color ${item.color_id}`,
          quantity: item.quantity,
        };

        // Add size information for 'pasang' transfers
        if (item.transfer_type === "pasang" && item.size_id) {
          const size = sizesMap.get(item.size_id);
          detailItem.sizeName = size?.size_name || `Size ${item.size_id}`;
        }

        return detailItem;
      },
    );

    // Create the transfer details object
    const transferDetails: TransferDetails = {
      id: transfer.id,
      transferNumber: transfer.transfer_number,
      transferDate: transfer.transfer_date,
      sourceLocationName:
        transfer.source_location?.location_name ||
        `Location ${transfer.source_location_id}`,
      sourceLocationAddress: transfer.source_location?.address,
      destinationLocationName:
        transfer.destination_location?.location_name ||
        `Location ${transfer.destination_location_id}`,
      destinationLocationAddress: transfer.destination_location?.address,
      transferType,
      notes: transfer.notes,
      items,
    };

    return transferDetails;
  } catch (error) {
    console.error(`Error in getTransferDetails for ID ${transferId}:`, error);
    throw error;
  }
};
