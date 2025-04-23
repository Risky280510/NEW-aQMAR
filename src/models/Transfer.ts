// Define the data type for a transfer item
export interface TransferItem {
  productId: number;
  colorId: number;
  sizeId?: number; // Optional, only for type 'pasang'
  quantity: number; // Number of dus or pasang
}

// Define the data type for the transfer input
export interface CreateTransferInput {
  sourceLocationId: number;
  destinationLocationId: number;
  transferType: "dus" | "pasang"; // Type of goods transferred
  transferDate: string; // ISO string format
  notes?: string;
  items: TransferItem[];
}

// Define the data type for the transfer output
export interface Transfer extends CreateTransferInput {
  id: number;
  status: "pending" | "in_transit" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

// Define the data type for the transfer history item
export interface TransferHistoryItem {
  id: number; // Unique ID of the related transfer or transaction
  transferDate: string; // ISO string format
  sourceLocationName: string; // Name of the originating location
  destinationLocationName: string; // Name of the destination location
  productName: string;
  colorName: string;
  sizeName?: string; // Optional, only filled if transferType = 'pasang'
  quantity: number;
  transferType: "dus" | "pasang";
  notes?: string;
  status: "pending" | "in_transit" | "completed" | "cancelled";
}
