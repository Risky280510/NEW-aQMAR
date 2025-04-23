export interface GoodsReceipt {
  id?: number;
  receipt_date: string;
  product_id: number;
  color_id: number;
  bun_count: number;
  supplier?: string;
  reference_number?: string;
  location_id: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GoodsReceiptHistoryItem {
  id: number;
  receipt_date: string;
  reference_number?: string;
  supplier?: string;
  locationName: string;
  productName: string;
  colorName: string;
  bun_count: number;
  status: string;
  created_by?: string;
}
