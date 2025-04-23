import { Location } from "../models/Location";
import { getLocations } from "./locationService";
import {
  WarehouseDusStockItem,
  WarehousePasangStockItem,
  getWarehouseDusStock,
  getWarehousePasangStock,
} from "./warehouseService";

// Define types that include location information
export interface DusStockItemWithLocation extends WarehouseDusStockItem {
  locationId: number;
  locationName: string;
}

export interface PasangStockItemWithLocation extends WarehousePasangStockItem {
  locationId: number;
  locationName: string;
}

// Define the data type for each movement row in the stock card
export interface StockCardMovement {
  id: number | string; // Unique ID of the inventory transaction
  transactionDate: string | Date;
  transactionType: string; // Readable description (e.g. "Warehouse Receipt", "Sales of Store A", "Transfer Out to Store B", "Adjustment Opname +", "Reject")
  referenceNumber?: string; // Note No., Transfer No., SO No., etc.
  fromLocation?: string; // Origin location name (for incoming transfers)
  toLocation?: string; // Destination location name (for outgoing transfers)
  masukQty: number | null; // Incoming amount (Dus or Pasang, null if out)
  keluarQty: number | null; // Outgoing amount (Dus or Pasang, null if in)
  saldoAkhir: number; // Balance after this transaction (Dus or Pasang)
}

// Define the return type for the stock card function
export interface StockCardData {
  startingBalance: number;
  movements: StockCardMovement[];
}

// Define the data type for conversion history items
export interface ConversionHistoryItem {
  id: number | string; // Unique ID of the conversion transaction
  conversionDate: string | Date;
  locationName: string; // Location Name (usually Main Warehouse)
  productName: string;
  colorName: string;
  amountDus: number; // Number of boxes converted in this transaction
  expectedPairs: number; // Result of related product's sumBox * contentsBox
  actualPairs?: number; // Actual number of pairs counted (if available)
  status?: string; // Status of the conversion (e.g., "Completed", "Pending Count")
  referenceNumber?: string; // Reference number for the conversion
}

// Define the data type for stock opname adjustment items
export interface OpnameAdjustmentItem {
  id: number | string; // Unique ID of the inventory_transactions transaction
  tanggalPenyesuaian: string | Date;
  locationName: string;
  productName: string;
  colorName: string;
  sizeName?: string; // Only filled if the stock adjustment is set
  tipeStok: "dus" | "pasang"; // Adjusted stock type
  penyesuaianJumlah: number; // The difference (can be positive if adding, negative if subtracting)
  reason?: string; // Reason for adjustment if recorded during inventory
  stokSystemBefore?: number; // System stock before adjustment
  stokFisik?: number; // Physical stock counted
}

// Get all dus stock from all locations with optional filtering
export const getAllDusStock = async (filters?: {
  locationId?: number;
}): Promise<DusStockItemWithLocation[]> => {
  try {
    // Get all locations
    const locations = await getLocations();

    // If a specific location is requested, filter the locations
    const locationsToFetch = filters?.locationId
      ? locations.filter((loc) => loc.id === filters.locationId)
      : locations;

    // Fetch stock data for each location
    const stockPromises = locationsToFetch.map(async (location) => {
      if (!location.id) return [];

      const stockItems = await getWarehouseDusStock(location.id);

      // Add location information to each stock item
      return stockItems.map((item) => ({
        ...item,
        locationId: location.id as number,
        locationName: location.location_name,
      }));
    });

    // Wait for all promises to resolve and flatten the array
    const allStockData = await Promise.all(stockPromises);
    return allStockData.flat();
  } catch (error) {
    console.error("Error fetching all dus stock:", error);
    throw error;
  }
};

// Get all pasang stock from all locations with optional filtering
export const getAllPasangStock = async (filters?: {
  locationId?: number;
}): Promise<PasangStockItemWithLocation[]> => {
  try {
    // Get all locations
    const locations = await getLocations();

    // If a specific location is requested, filter the locations
    const locationsToFetch = filters?.locationId
      ? locations.filter((loc) => loc.id === filters.locationId)
      : locations;

    // Fetch stock data for each location
    const stockPromises = locationsToFetch.map(async (location) => {
      if (!location.id) return [];

      const stockItems = await getWarehousePasangStock(location.id);

      // Add location information to each stock item
      return stockItems.map((item) => ({
        ...item,
        locationId: location.id as number,
        locationName: location.location_name,
      }));
    });

    // Wait for all promises to resolve and flatten the array
    const allStockData = await Promise.all(stockPromises);
    return allStockData.flat();
  } catch (error) {
    console.error("Error fetching all pasang stock:", error);
    throw error;
  }
};

// Get stock card data for a specific item in a specific location within a date range
export const getStockCard = async (params: {
  locationId: number;
  type: "dus" | "pasang";
  productId: number;
  colorId: number;
  sizeId?: number;
  dateRange: [Date, Date];
}): Promise<StockCardData> => {
  try {
    // In a real implementation, this would fetch data from the backend
    // For now, return mock data

    // Mock starting balance
    const startingBalance = 50;

    // Generate mock movements
    const movements: StockCardMovement[] = [
      {
        id: 1,
        transactionDate: new Date(params.dateRange[0].getTime() + 86400000), // One day after start date
        transactionType: "Warehouse Receipt",
        referenceNumber: "RCV-001",
        masukQty: 20,
        keluarQty: null,
        saldoAkhir: 70,
      },
      {
        id: 2,
        transactionDate: new Date(params.dateRange[0].getTime() + 172800000), // Two days after start date
        transactionType: "Transfer Out to Store A",
        referenceNumber: "TRF-001",
        toLocation: "Store A",
        masukQty: null,
        keluarQty: 15,
        saldoAkhir: 55,
      },
      {
        id: 3,
        transactionDate: new Date(params.dateRange[0].getTime() + 259200000), // Three days after start date
        transactionType: "Adjustment Opname +",
        referenceNumber: "ADJ-001",
        masukQty: 5,
        keluarQty: null,
        saldoAkhir: 60,
      },
      {
        id: 4,
        transactionDate: new Date(params.dateRange[0].getTime() + 345600000), // Four days after start date
        transactionType: "Reject",
        referenceNumber: "REJ-001",
        masukQty: null,
        keluarQty: 3,
        saldoAkhir: 57,
      },
      {
        id: 5,
        transactionDate: new Date(params.dateRange[0].getTime() + 432000000), // Five days after start date
        transactionType: "Transfer In from Warehouse B",
        referenceNumber: "TRF-002",
        fromLocation: "Warehouse B",
        masukQty: 10,
        keluarQty: null,
        saldoAkhir: 67,
      },
    ];

    return { startingBalance, movements };
  } catch (error) {
    console.error("Error fetching stock card data:", error);
    throw error;
  }
};

// Get conversion history with optional filtering by date range and location
export const getConversionHistory = async (filters?: {
  dateRange?: [Date, Date];
  locationId?: number;
}): Promise<ConversionHistoryItem[]> => {
  try {
    // In a real implementation, this would fetch data from the backend
    // For now, return mock data
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    // Generate mock conversion history data
    const mockData: ConversionHistoryItem[] = [
      {
        id: "CONV-001",
        conversionDate: new Date(today.getTime() - oneDay * 2), // 2 days ago
        locationName: "Main Warehouse",
        productName: "Sepatu Casual Pria",
        colorName: "Black",
        amountDus: 5,
        expectedPairs: 60, // 12 pairs per box
        actualPairs: 58,
        status: "Completed",
        referenceNumber: "BOX-001",
      },
      {
        id: "CONV-002",
        conversionDate: new Date(today.getTime() - oneDay * 4), // 4 days ago
        locationName: "Main Warehouse",
        productName: "Sepatu Formal Pria",
        colorName: "Brown",
        amountDus: 3,
        expectedPairs: 36, // 12 pairs per box
        actualPairs: 36,
        status: "Completed",
        referenceNumber: "BOX-002",
      },
      {
        id: "CONV-003",
        conversionDate: new Date(today.getTime() - oneDay * 5), // 5 days ago
        locationName: "Main Warehouse",
        productName: "Sepatu Casual Wanita",
        colorName: "Red",
        amountDus: 4,
        expectedPairs: 48, // 12 pairs per box
        actualPairs: 46,
        status: "Completed",
        referenceNumber: "BOX-003",
      },
      {
        id: "CONV-004",
        conversionDate: new Date(today.getTime() - oneDay), // 1 day ago
        locationName: "Main Warehouse",
        productName: "Sepatu Sport Pria",
        colorName: "Blue",
        amountDus: 6,
        expectedPairs: 72, // 12 pairs per box
        status: "Pending Count",
        referenceNumber: "BOX-004",
      },
      {
        id: "CONV-005",
        conversionDate: today, // Today
        locationName: "Main Warehouse",
        productName: "Sepatu Anak",
        colorName: "Green",
        amountDus: 2,
        expectedPairs: 24, // 12 pairs per box
        status: "Pending Count",
        referenceNumber: "BOX-005",
      },
    ];

    // Apply date range filter if provided
    let filteredData = mockData;
    if (filters?.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.conversionDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Apply location filter if provided
    if (filters?.locationId) {
      // In a real implementation, this would filter by locationId
      // For mock data, we'll just assume all data is from the main warehouse
      // and only return data if the locationId matches the main warehouse ID (1)
      if (filters.locationId !== 1) {
        return [];
      }
    }

    // Sort by date (newest first)
    return filteredData.sort((a, b) => {
      return (
        new Date(b.conversionDate).getTime() -
        new Date(a.conversionDate).getTime()
      );
    });
  } catch (error) {
    console.error("Error fetching conversion history:", error);
    throw error;
  }
};

// Get stock opname adjustment history with optional filtering by date range and location
export const getOpnameAdjustments = async (filters?: {
  dateRange?: [Date, Date];
  locationId?: number;
}): Promise<OpnameAdjustmentItem[]> => {
  try {
    // In a real implementation, this would fetch data from the backend
    // For now, return mock data
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    // Generate mock opname adjustment data
    const mockData: OpnameAdjustmentItem[] = [
      {
        id: "ADJ-001",
        tanggalPenyesuaian: new Date(today.getTime() - oneDay * 2), // 2 days ago
        locationName: "Main Warehouse",
        productName: "Sepatu Casual Pria",
        colorName: "Black",
        tipeStok: "dus",
        penyesuaianJumlah: 5, // Positive adjustment (adding stock)
        reason: "Stock count higher than system",
        stokSystemBefore: 45,
        stokFisik: 50,
      },
      {
        id: "ADJ-002",
        tanggalPenyesuaian: new Date(today.getTime() - oneDay * 3), // 3 days ago
        locationName: "Store A",
        productName: "Sepatu Formal Pria",
        colorName: "Brown",
        sizeName: "42",
        tipeStok: "pasang",
        penyesuaianJumlah: -3, // Negative adjustment (removing stock)
        reason: "Stock count lower than system",
        stokSystemBefore: 28,
        stokFisik: 25,
      },
      {
        id: "ADJ-003",
        tanggalPenyesuaian: new Date(today.getTime() - oneDay * 5), // 5 days ago
        locationName: "Main Warehouse",
        productName: "Sepatu Casual Wanita",
        colorName: "Red",
        tipeStok: "dus",
        penyesuaianJumlah: -2, // Negative adjustment
        reason: "Damaged boxes found during count",
        stokSystemBefore: 30,
        stokFisik: 28,
      },
      {
        id: "ADJ-004",
        tanggalPenyesuaian: new Date(today.getTime() - oneDay), // 1 day ago
        locationName: "Store B",
        productName: "Sepatu Sport Pria",
        colorName: "Blue",
        sizeName: "43",
        tipeStok: "pasang",
        penyesuaianJumlah: 8, // Positive adjustment
        reason: "Uncounted stock found in storage",
        stokSystemBefore: 42,
        stokFisik: 50,
      },
      {
        id: "ADJ-005",
        tanggalPenyesuaian: today, // Today
        locationName: "Store C",
        productName: "Sepatu Anak",
        colorName: "Green",
        sizeName: "28",
        tipeStok: "pasang",
        penyesuaianJumlah: -1, // Negative adjustment
        reason: "Missing pair",
        stokSystemBefore: 15,
        stokFisik: 14,
      },
    ];

    // Apply date range filter if provided
    let filteredData = mockData;
    if (filters?.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.tanggalPenyesuaian);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Apply location filter if provided
    if (filters?.locationId) {
      // In a real implementation, this would filter by locationId
      // For mock data, we'll just assume all data is from the main warehouse
      // and only return data if the locationId matches the main warehouse ID (1)
      if (filters.locationId !== 1) {
        return [];
      }
    }

    // Sort by date (newest first)
    return filteredData.sort((a, b) => {
      return (
        new Date(b.tanggalPenyesuaian).getTime() -
        new Date(a.tanggalPenyesuaian).getTime()
      );
    });
  } catch (error) {
    console.error("Error fetching opname adjustment history:", error);
    throw error;
  }
};

// Export as a named export for use in components
export const reportService = {
  getAllDusStock,
  getAllPasangStock,
  getStockCard,
  getConversionHistory,
  getOpnameAdjustments,
};
